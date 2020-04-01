import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { tradeFinanceManager } from '@komgo/permissions'
import { ReplyType, IQuote, IReceivablesDiscounting } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { NotificationClient } from '../../../business-layer/microservice-clients'
import { ReplyDataAgent, QuoteDataAgent, ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { InvalidPayloadProcessingError } from '../../errors'
import { IReceivableFinanceMessage, IReceiveUpdateUseCase, UpdateType, IQuoteUpdatePayload } from '../../types'
import { QuoteValidator } from '../../validation'

@injectable()
export class ReceiveFinalAgreedTermsUpdateUseCase implements IReceiveUpdateUseCase<IQuote> {
  private logger = getLogger('ReceiveFinalAgreedTermsUpdateUseCase')

  constructor(
    @inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.QuoteValidator) private readonly quoteValidator: QuoteValidator,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient
  ) {}

  public async execute(message: IReceivableFinanceMessage<IQuoteUpdatePayload>): Promise<void> {
    const updatedQuote = message.data.entry
    this.logger.info('Received Final Agreed Terms Update message', { staticId: updatedQuote.staticId })

    const current = await this.quoteDataAgent.findByStaticId(updatedQuote.staticId)
    if (!current) {
      this.logAndThrowProcessingError(
        'Final agreed terms not found',
        ErrorName.UpdateFinalAgreedTermsFailedQuoteNotFound,
        {
          quoteId: updatedQuote.staticId
        }
      )
    }
    if (new Date(current.createdAt).getTime() >= new Date(updatedQuote.createdAt).getTime()) {
      this.logger.info('Received is older or the same as current quote. Skipping update')
      return
    }
    const acceptedReply = await this.replyDataAgent.findByQuoteIdAndType(updatedQuote.staticId, ReplyType.Accepted)
    if (!acceptedReply) {
      this.logAndThrowProcessingError(
        'request has not been accepted',
        ErrorName.UpdateFinalAgreedTermsFailedInvalidState,
        {
          quoteId: updatedQuote.staticId
        }
      )
    }
    if (message.data.senderStaticId !== acceptedReply.participantId) {
      this.logAndThrowProcessingError(
        'quote was not accepted for this sender',
        ErrorName.UpdateFinalAgreedTermsFailedIncorrectParticipant,
        {
          senderStaticId: message.data.senderStaticId,
          acceptedParticipantId: acceptedReply.participantId
        }
      )
    }

    const rd = await this.rdDataAgent.findByStaticId(acceptedReply.rdId)
    this.validate(updatedQuote, rd)

    await this.quoteDataAgent.updateCreate(updatedQuote)
    await this.sendNotification(message, acceptedReply, updatedQuote.createdAt, rd)
    this.logger.info('Final agreed terms successfully updated')
  }

  private async sendNotification(
    message: IReceivableFinanceMessage<IQuoteUpdatePayload>,
    acceptedReply: IReply,
    createdAt: string,
    rd: IReceivablesDiscounting
  ) {
    if (rd) {
      const notification = await this.notificationClient.createUpdateNotification(
        rd,
        message.data.senderStaticId,
        UpdateType.FinalAgreedTermsData,
        tradeFinanceManager.canReadRD.action,
        message.context,
        createdAt
      )
      await this.notificationClient.sendNotification(notification)
    } else {
      this.logger.warn(
        ErrorCode.DatabaseInvalidData,
        ErrorName.FinalAgreedTermsNotificationFailedNoRd,
        'Failed to find the RD Application associated with this final agreed terms',
        { rdId: acceptedReply.rdId }
      )
    }
  }

  private validate(quote: IQuote, rd: IReceivablesDiscounting) {
    try {
      this.quoteValidator.validateFieldsExtended(quote, rd)
    } catch (e) {
      this.logAndThrowProcessingError(
        'Invalid update to final agreed terms',
        ErrorName.UpdateFinalAgreedTermsFailedFieldValidation,
        {
          validationErrors: e.validationErrors
        }
      )
      throw new InvalidPayloadProcessingError(e.message)
    }
  }

  private logAndThrowProcessingError(errorMsg: string, errorName: ErrorName, context?: any) {
    const msg = `Unable to update final agreed terms - ${errorMsg}`
    this.logger.error(ErrorCode.ValidationInternalAMQP, errorName, msg, context)
    throw new InvalidPayloadProcessingError(msg)
  }
}
