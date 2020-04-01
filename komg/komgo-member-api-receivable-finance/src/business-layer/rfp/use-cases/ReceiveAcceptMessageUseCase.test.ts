import { IRFPMessage, IRFPResponsePayload } from '@komgo/messaging-types'
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
import { InvalidPayloadProcessingError, ValidationDuplicateError, ValidationFieldError } from '../../errors'
import { buildFakeResponsePayload, buildFakeRFPMessage } from '../../messaging/faker'
import { CompanyRegistryClient, NotificationClient } from '../../microservice-clients'
import { IProductResponse } from '../../types'
import { RFPValidator, QuoteValidator } from '../../validation'

import { ReceiveAcceptMessageUseCase } from './ReceiveAcceptMessageUseCase'

const mockRFPReplyAccepted = buildFakeReply({ type: ReplyType.Accepted })

describe('ReceiveAcceptMessageUseCase', () => {
  let useCase: ReceiveAcceptMessageUseCase
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockNotificationClient: jest.Mocked<NotificationClient>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>
  let mockQuoteValidator: jest.Mocked<QuoteValidator>

  let mockMessage: IRFPMessage<IRFPResponsePayload<IProductResponse>>

  beforeEach(() => {
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)
    mockRFPValidator = createMockInstance(RFPValidator)
    mockNotificationClient = createMockInstance(NotificationClient)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)
    mockQuoteValidator = createMockInstance(QuoteValidator)

    useCase = new ReceiveAcceptMessageUseCase(
      mockReplyDataAgent,
      mockQuoteDataAgent,
      mockRFPValidator,
      mockNotificationClient,
      mockCompanyRegistryClient,
      mockQuoteValidator
    )

    mockMessage = buildFakeMessageWithQuote()
  })

  it('should throw InvalidPayloadProcessingError if there is no quote', async () => {
    delete mockMessage.data.response.quote

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"RD Accept message is missing a quote"`)
  })

  it('should throw an InvalidPayloadProcessingError field error if RFPValidator throws duplicate error', async () => {
    mockRFPValidator.validateInboundQuoteAccept.mockRejectedValueOnce(
      new ValidationDuplicateError('quote validation failed')
    )

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"RD Accept message cannot be processed by member"`
    )
  })

  it('should throw an InvalidPayloadProcessingError field error if RFPValidator throws field error', async () => {
    mockRFPValidator.validateInboundQuoteAccept.mockRejectedValueOnce(
      new ValidationFieldError('quote validation failed', [] as any)
    )

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"RD Accept message cannot be processed by member"`
    )
  })

  it('should rethrow any unrecognised error thrown by RFPValidator', async () => {
    mockRFPValidator.validateInboundQuoteAccept.mockRejectedValueOnce(new Error('quote validation failed'))

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(Error)
    await expect(promise).rejects.not.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"quote validation failed"`)
  })

  it('should succeed to create a quote and rfp reply', async () => {
    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Company Name')

    await useCase.execute(mockMessage)

    expect(mockQuoteValidator.findRDAndValidate).toHaveBeenCalledWith(
      mockMessage.data.response.rfpReply.rdId,
      mockMessage.data.response.quote
    )
    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledWith(mockMessage.data.response.quote)
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(mockMessage.data.senderStaticID)
    expect(mockNotificationClient.createRFPNotification).toHaveBeenCalledWith(
      mockMessage.context,
      ReplyType.Accepted,
      'Receivable discounting quote accepted by Company Name',
      tradeFinanceManager.canReadRDRequests.action,
      mockMessage.data.senderStaticID,
      'Receivable discounting quote accepted'
    )
    expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
  })

  it('should not fail if there is a duplicate RFP Reply', async () => {
    mockReplyDataAgent.findByStaticId.mockResolvedValueOnce(mockRFPReplyAccepted)

    await useCase.execute(mockMessage)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledWith(mockMessage.data.response.quote)
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
  })
})

const buildFakeMessageWithQuote = (overrides: Partial<IQuote> = {}) => {
  const quote = buildFakeQuote(overrides)
  const reply = buildFakeReply()
  const payload = buildFakeResponsePayload(reply, quote)
  const message = buildFakeRFPMessage(payload)
  return message
}
