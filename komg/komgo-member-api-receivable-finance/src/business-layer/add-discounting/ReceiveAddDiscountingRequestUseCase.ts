import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { tradeFinanceManager } from '@komgo/permissions'
import { ReplyType, IReceivablesDiscounting } from '@komgo/types'
import { injectable, inject } from 'inversify'
import 'reflect-metadata'

import { PRODUCT_ID, SubProductId } from '../../constants'
import { ReplyDataAgent, ReceivablesDiscountingDataAgent } from '../../data-layer/data-agents'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify'
import { FailureType, Metric, MessageDirection, MessageStatus } from '../../Metric'
import { removeTimeFromDates } from '../../utils'
import { EntityNotFoundError, ValidationFieldError, InvalidPayloadProcessingError } from '../errors'
import { TaskClient, CompanyRegistryClient } from '../microservice-clients'
import { IReceivableFinanceMessage, IAddDiscountingPayload, TaskType } from '../types'
import { AcceptedRDValidator, AddDiscountingValidator } from '../validation'

@injectable()
export class ReceiveAddDiscountingRequestUseCase {
  logger = getLogger('ReceiveAddDiscountingRequestUseCase')

  constructor(
    @inject(TYPES.AcceptedRDValidator) private readonly acceptedRDValidator: AcceptedRDValidator,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.AddDiscountingValidator) private readonly addDiscountingValidator: AddDiscountingValidator,
    @inject(TYPES.ReceivablesDiscountingDataAgent)
    private readonly receivablesDiscountingDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient
  ) {}

  async execute(
    messageContent: IReceivableFinanceMessage<IAddDiscountingPayload<IReceivablesDiscounting>>
  ): Promise<void> {
    const {
      data: { reply, entry, senderStaticId }
    } = messageContent

    await this.validateExistingRD(entry.staticId)
    await this.validateAddDiscountingRequest(entry.staticId)
    this.validateEntry(entry)

    await this.receivablesDiscountingDataAgent.updateCreate(entry)
    // create Reply last, since it does not use updateCreate. It should only be created once per message
    await this.replyDataAgent.create(reply)
    await this.sendTask(senderStaticId, entry)
  }

  private validateEntry(entry: IReceivablesDiscounting): void {
    try {
      this.addDiscountingValidator.validate(removeTimeFromDates(entry))
    } catch (error) {
      if (error instanceof ValidationFieldError) {
        this.throwInvalidPayloadProcessingError(
          error.message,
          ErrorName.ReceiveAddDiscountingRequestValidationInvalidEntry,
          FailureType.ValidationFailure,
          { rdId: entry.staticId, errorMessage: error.message }
        )
      } else {
        this.logger.error(
          ErrorCode.UnexpectedError,
          ErrorName.UnexpectedError,
          'An unexpected error occurred while checking that a quote has been accepted for this RD',
          { errorMessage: error.message, rdId: entry.staticId }
        )
        throw error
      }
    }
  }

  private async validateAddDiscountingRequest(rdId: string): Promise<void> {
    const existingReply = await this.replyDataAgent.findByRdIdAndType(rdId, ReplyType.AddDiscountingRequest)
    if (existingReply) {
      this.throwInvalidPayloadProcessingError(
        'Received add discouting request has already been received for the chosen RD',
        ErrorName.ReceivedAddDiscoutingRequestExists,
        FailureType.ValidationFailure,
        { rdId, replyId: existingReply.staticId }
      )
    }
  }

  private async validateExistingRD(rdId: string): Promise<void> {
    try {
      await this.acceptedRDValidator.validateRDAccepted(rdId)
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        this.throwInvalidPayloadProcessingError(
          error.message,
          ErrorName.ReceiveAddDiscountingRequestValidationRDNotFound,
          FailureType.ValidationFailure,
          { rdId, errorMessage: error.message }
        )
      } else if (error instanceof ValidationFieldError) {
        this.throwInvalidPayloadProcessingError(
          error.message,
          ErrorName.ReceiveAddDiscountingRequestValidationQuoteNotAccepted,
          FailureType.ValidationFailure,
          { rdId, errorMessage: error.message }
        )
      } else {
        this.logger.error(
          ErrorCode.UnexpectedError,
          ErrorName.UnexpectedError,
          'An unexpected error occurred while checking that a quote has been accepted for this RD',
          { errorMessage: error.message, rdId }
        )
        throw error
      }
    }
  }

  private async sendTask(senderStaticId: string, entry: IReceivablesDiscounting) {
    const taskSummary = 'Receivable discounting request to add discounting received'
    const senderName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
    const notifMsg = `${senderName} has requested to add discounting for trade ID ${entry.tradeReference.sourceId}`
    const emailData = this.taskClient.resolveTaskEmail(notifMsg)

    const task = this.taskClient.createTaskRequest(
      TaskType.AddDiscountingRequestTaskType,
      taskSummary,
      senderStaticId,
      tradeFinanceManager.canReadRDRequests.action,
      { productId: PRODUCT_ID, subProductId: SubProductId.ReceivableDiscounting, rdId: entry.staticId },
      emailData
    )
    await this.taskClient.sendTask(task, notifMsg)
  }

  private throwInvalidPayloadProcessingError(
    msg: string,
    errorName: ErrorName,
    type: FailureType,
    ...loggerArgs: any[]
  ) {
    this.logger.error(ErrorCode.ValidationInternalAMQP, errorName, msg, ...loggerArgs)
    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.MessageType]: Metric.AddDiscountingRequestReceived,
      [Metric.MessageStatus]: MessageStatus.Failed,
      [Metric.FailureType]: type
    })
    throw new InvalidPayloadProcessingError(msg)
  }
}
