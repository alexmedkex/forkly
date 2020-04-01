import { tradeFinanceManager } from '@komgo/permissions'
import {
  IQuote,
  buildFakeQuote,
  ReplyType,
  buildFakeReceivablesDiscountingExtended,
  IReceivablesDiscounting
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'

import { QuoteDataAgent, ReplyDataAgent, ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { datePlusHours } from '../../../test-utils'
import { InvalidPayloadProcessingError, ValidationFieldError } from '../../errors'
import { buildFakeReceivableFinanceMessage } from '../../messaging/faker'
import { NotificationClient } from '../../microservice-clients'
import { IReceivableFinanceMessage, UpdateType, IUpdatePayload } from '../../types'
import { QuoteValidator } from '../../validation'

import { ReceiveFinalAgreedTermsUpdateUseCase } from './ReceiveFinalAgreedTermsUpdateUseCase'

const PARTICIPANT_ID = 'participant-id'

describe('ReceiveFinalAgreedTermsUpdateUseCase', () => {
  let useCase: ReceiveFinalAgreedTermsUpdateUseCase
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockQuoteValidator: jest.Mocked<QuoteValidator>
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockNotificationClient: jest.Mocked<NotificationClient>

  let msg: IReceivableFinanceMessage<IUpdatePayload<IQuote>>
  let quote: IQuote
  let rd: IReceivablesDiscounting

  beforeEach(() => {
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockQuoteValidator = createMockInstance(QuoteValidator)
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockNotificationClient = createMockInstance(NotificationClient)
    useCase = new ReceiveFinalAgreedTermsUpdateUseCase(
      mockQuoteDataAgent,
      mockReplyDataAgent,
      mockRdDataAgent,
      mockQuoteValidator,
      mockNotificationClient
    )

    quote = buildFakeQuote()
    rd = buildFakeReceivablesDiscountingExtended()

    mockRdDataAgent.findByStaticId.mockResolvedValueOnce(rd)
  })

  it('should throw an InvalidPayloadProcessingError error if quote is not found', async () => {
    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(undefined)
    msg = createMessage(quote)

    const promise = useCase.execute(msg)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to update final agreed terms - Final agreed terms not found"`
    )
  })

  it('should throw an InvalidPayloadProcessingError error if quote is yet to be accepted', async () => {
    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(quote)
    mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce(undefined)
    msg = createMessage(quote, 2)

    const promise = useCase.execute(msg)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to update final agreed terms - request has not been accepted"`
    )
  })

  it('should throw an InvalidPayloadProcessingError error if update is not coming from the bank that sent the quote', async () => {
    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(quote)
    mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce(
      buildFakeReply({ participantId: 'incorrect-static-id', type: ReplyType.Accepted })
    )
    msg = createMessage(quote, 2)

    const promise = useCase.execute(msg)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to update final agreed terms - quote was not accepted for this sender"`
    )
  })

  it('should throw an InvalidPayloadProcessingError if validation fails', async () => {
    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(quote)
    mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce(
      buildFakeReply({ participantId: PARTICIPANT_ID, type: ReplyType.Accepted })
    )
    mockQuoteValidator.validateFieldsExtended.mockImplementationOnce(() => {
      throw new ValidationFieldError('quote validation failed', [] as any)
    })
    msg = createMessage(quote, 2)

    const promise = useCase.execute(msg)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to update final agreed terms - Invalid update to final agreed terms"`
    )
    expect(mockQuoteValidator.validateFieldsExtended).toHaveBeenCalledWith(msg.data.entry, rd)
  })

  it('should successfully update the quote', async () => {
    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(quote)
    mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce(
      buildFakeReply({ participantId: PARTICIPANT_ID, type: ReplyType.Accepted })
    )

    msg = createMessage(quote, 2)

    await useCase.execute(msg)

    expect(mockQuoteValidator.validateFieldsExtended).toHaveBeenCalledWith(msg.data.entry, rd)
    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledWith(msg.data.entry)
  })

  it('should successfully update the quote and send notification', async () => {
    const acceptedReply = buildFakeReply({
      participantId: PARTICIPANT_ID,
      senderStaticId: PARTICIPANT_ID,
      type: ReplyType.Accepted
    })
    const notification = {} as any

    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(quote)
    mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce(acceptedReply)
    mockNotificationClient.createUpdateNotification.mockResolvedValueOnce(notification)
    msg = createMessage(quote, 2)

    await useCase.execute(msg)

    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledWith(msg.data.entry)
    expect(mockRdDataAgent.findByStaticId).toHaveBeenCalledWith(acceptedReply.rdId)
    expect(mockNotificationClient.createUpdateNotification).toHaveBeenCalledWith(
      rd,
      msg.data.senderStaticId,
      UpdateType.FinalAgreedTermsData,
      tradeFinanceManager.canReadRD.action,
      msg.context,
      msg.data.entry.createdAt
    )
    expect(mockNotificationClient.sendNotification).toHaveBeenCalledWith(notification)
  })

  it('should not update the quote if the updated quote is older than the current one', async () => {
    mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(quote)
    msg = createMessage(quote, -2)

    await useCase.execute(msg)

    expect(mockQuoteDataAgent.findByStaticId).toHaveBeenCalled()
    expect(mockQuoteDataAgent.updateCreate).not.toHaveBeenCalled()
  })
})

function createMessage(current: IQuote, hours = 2) {
  const update = { ...current, createdAt: datePlusHours(current.createdAt, hours), advancedRate: 1 }
  const msg = buildFakeReceivableFinanceMessage(update, UpdateType.ReceivablesDiscounting)
  msg.data.senderStaticId = PARTICIPANT_ID
  return msg
}
