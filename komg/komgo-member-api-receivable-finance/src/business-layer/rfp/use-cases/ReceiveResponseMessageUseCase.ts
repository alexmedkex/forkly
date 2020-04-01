import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRFPMessage, IRFPResponsePayload } from '@komgo/messaging-types'
import { tradeFinanceManager } from '@komgo/permissions'
import { ReplyType } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { REDACTED_CONTENT } from '../../../constants'
import { QuoteDataAgent, ReplyDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify/types'
import { InvalidPayloadProcessingError } from '../../errors/InvalidPayloadProcessingError'
import { CompanyRegistryClient, NotificationClient, TaskClient } from '../../microservice-clients'
import { TaskType } from '../../types'
import { IProductResponse } from '../../types/IProductResponse'
import { RFPValidator, QuoteValidator } from '../../validation'

import { IReceiveMessageUseCase } from './IReceiveMessageUseCase'

const RFP_REJECTED = `Receivable discounting request for proposal rejected`

@injectable()
export class ReceiveResponseMessageUseCase implements IReceiveMessageUseCase {
  private readonly logger = getLogger('ReceiveResponseMessageUseCase')

  constructor(
    @inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient,
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.QuoteValidator) private readonly quoteValidator: QuoteValidator
  ) {}

  /**
   * Process a RFP Response/Reject message with a RD response
   * @param message will contain a Response through RFP: RFP.Response or RFP.Reject (if the request was rejected)
   *
   * @throws InvalidPayloadProcessingError if the payload is invalid and can't be processed
   */
  public async execute(message: IRFPMessage<IRFPResponsePayload<IProductResponse>>) {
    this.logger.info('Processing received Response message', {
      message: { ...message, data: REDACTED_CONTENT }
    })

    const productResponse: IProductResponse = message.data.response
    await this.validateProductResponse(productResponse)

    if (productResponse.rfpReply.type !== ReplyType.Reject) {
      await this.quoteDataAgent.updateCreate(productResponse.quote)
    }
    await this.replyDataAgent.updateCreate(productResponse.rfpReply)

    await this.sendTaskOrNotification(productResponse.rfpReply.type, message.context, message.data.senderStaticID)

    this.logger.info('Successfully processed message from RFP for a RD Response', {
      rdId: productResponse.rfpReply.rdId
    })
  }

  private async validateProductResponse(productResponse: IProductResponse) {
    const quote = productResponse.quote
    if (productResponse.rfpReply.type !== ReplyType.Reject && !quote) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.RFPReplyQuoteNotFound, {
        quote
      })
      throw new InvalidPayloadProcessingError('RD Response message is missing a quote')
    }

    if (quote) {
      try {
        await this.quoteValidator.findRDAndValidate(productResponse.rfpReply.rdId, quote)
      } catch (error) {
        throw new InvalidPayloadProcessingError('Invalid quote payload')
      }
    }

    await this.rfpValidator.validateRFPReplyNotProcessed(productResponse.rfpReply)
  }

  private async sendTaskOrNotification(replyType: ReplyType, context: any, senderStaticId: string) {
    if (replyType === ReplyType.Submitted) {
      await this.sendTask(context, senderStaticId)
    }
    if (replyType === ReplyType.Reject) {
      await this.sendRejectedNotification(context, senderStaticId)
    }
  }

  private async sendTask(context: any, senderStaticId: string) {
    const taskSummary = 'Receivable discounting quote submission received'
    const senderName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
    const notifMsg = `${taskSummary} from ${senderName}`
    const emailData = this.taskClient.resolveTaskEmail(notifMsg)

    const task = this.taskClient.createTaskRequest(
      TaskType.ResponseTaskType,
      taskSummary,
      senderStaticId,
      tradeFinanceManager.canReadRD.action,
      context,
      emailData
    )
    await this.taskClient.sendTask(task, notifMsg)
  }

  private async sendRejectedNotification(context: any, senderStaticId: string) {
    const senderCompanyName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
    const notifMsg = `${RFP_REJECTED} by ${senderCompanyName}`

    const notification = this.notificationClient.createRFPNotification(
      context,
      ReplyType.Reject,
      notifMsg,
      tradeFinanceManager.canReadRD.action,
      senderStaticId,
      RFP_REJECTED
    )
    await this.notificationClient.sendNotification(notification)
  }
}
