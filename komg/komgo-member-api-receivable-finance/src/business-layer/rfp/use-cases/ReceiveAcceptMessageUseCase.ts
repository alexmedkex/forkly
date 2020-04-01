import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRFPMessage, IRFPResponsePayload } from '@komgo/messaging-types'
import { tradeFinanceManager } from '@komgo/permissions'
import { ReplyType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { REDACTED_CONTENT } from '../../../constants'
import { QuoteDataAgent, ReplyDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { InvalidPayloadProcessingError, ValidationDuplicateError, ValidationFieldError } from '../../errors'
import { CompanyRegistryClient, NotificationClient } from '../../microservice-clients'
import { IProductResponse } from '../../types'
import { RFPValidator, QuoteValidator } from '../../validation'

import { IReceiveMessageUseCase } from './IReceiveMessageUseCase'

const RFP_ACCEPTED = `Receivable discounting quote accepted`

@injectable()
export class ReceiveAcceptMessageUseCase implements IReceiveMessageUseCase {
  private readonly logger = getLogger('ReceiveAcceptMessageUseCase')

  constructor(
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent,
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient,
    @inject(TYPES.QuoteValidator) private readonly quoteValidator: QuoteValidator
  ) {}

  /**
   * @throws InvalidPayloadProcessingError if the payload is invalid and can't be processed
   */
  public async execute(message: IRFPMessage<IRFPResponsePayload<IProductResponse>>) {
    const productResponse: IProductResponse = message.data.response
    this.logger.info('Processing received Response message', {
      message: { ...message, data: REDACTED_CONTENT }
    })

    await this.validateProductResponse(productResponse)
    await this.validateRFPReply(productResponse.rfpReply)

    await this.quoteDataAgent.updateCreate(productResponse.quote)
    await this.replyDataAgent.updateCreate(productResponse.rfpReply)

    this.logger.info('Successfully processed quote acceptance message', {
      rdId: productResponse.rfpReply.rdId
    })

    await this.sendNotification(message.context, message.data.senderStaticID)
  }

  private async validateRFPReply(rfpReply: IReply) {
    try {
      await this.rfpValidator.validateInboundQuoteAccept(rfpReply)
    } catch (error) {
      if (error instanceof ValidationDuplicateError || error instanceof ValidationFieldError) {
        this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.RFPAcceptCannotBeProcessed, {
          rfpReply
        })
        throw new InvalidPayloadProcessingError('RD Accept message cannot be processed by member')
      }
      throw error
    }
  }

  private async validateProductResponse(productResponse: IProductResponse) {
    const quote = productResponse.quote
    if (!quote) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.RFPAcceptQuoteNotFound, {
        quote
      })
      throw new InvalidPayloadProcessingError('RD Accept message is missing a quote')
    } else {
      try {
        await this.quoteValidator.findRDAndValidate(productResponse.rfpReply.rdId, quote)
      } catch (error) {
        throw new InvalidPayloadProcessingError('Invalid quote payload')
      }
    }

    await this.rfpValidator.validateRFPReplyNotProcessed(productResponse.rfpReply)
  }

  private async sendNotification(context: any, senderStaticId: string) {
    const senderCompanyName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
    const notifMsg = `${RFP_ACCEPTED} by ${senderCompanyName}`

    const notification = this.notificationClient.createRFPNotification(
      context,
      ReplyType.Accepted,
      notifMsg,
      tradeFinanceManager.canReadRDRequests.action,
      senderStaticId,
      RFP_ACCEPTED
    )
    await this.notificationClient.sendNotification(notification)
  }
}
