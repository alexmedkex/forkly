import { IRFPMessage, IRFPResponsePayload } from '@komgo/messaging-types'
import { tradeFinanceManager } from '@komgo/permissions'
import { IQuote, buildFakeQuote, ReplyType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'

import { RFPDataAgent, ReplyDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { InvalidPayloadProcessingError, ValidationDuplicateError, ValidationFieldError } from '../../errors'
import { buildFakeResponsePayload, buildFakeRFPMessage } from '../../messaging/faker'
import { NotificationClient, CompanyRegistryClient } from '../../microservice-clients'
import { IProductResponse } from '../../types'
import { RFPValidator } from '../../validation'

import { ReceiveDeclineMessageUseCase } from './ReceiveDeclineMessageUseCase'

describe('ReceiveDeclineMessageUseCase', () => {
  let useCase: ReceiveDeclineMessageUseCase
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockRFPDataAgent: jest.Mocked<RFPDataAgent>
  let mockMessage: IRFPMessage<IRFPResponsePayload<IProductResponse>>
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockNotificationClient: jest.Mocked<NotificationClient>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>

  beforeEach(() => {
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockRFPDataAgent = createMockInstance(RFPDataAgent)
    mockRFPValidator = createMockInstance(RFPValidator)
    mockNotificationClient = createMockInstance(NotificationClient)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)

    useCase = new ReceiveDeclineMessageUseCase(
      mockReplyDataAgent,
      mockRFPDataAgent,
      mockRFPValidator,
      'company-static-id',
      mockNotificationClient,
      mockCompanyRegistryClient
    )

    mockMessage = buildFakeMessageWithQuote()
  })

  it('should throw an InvalidPayloadProcessingError field error if inbound quote decline validation throws a duplicate error', async () => {
    mockRFPValidator.validateInboundQuoteDecline.mockRejectedValueOnce(
      new ValidationDuplicateError('reply validation failed')
    )

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"RD Decline message cannot be processed by member"`
    )
  })

  it('should throw an InvalidPayloadProcessingError field error if inbound quote decline validation throws a field or field error', async () => {
    mockRFPValidator.validateInboundQuoteDecline.mockRejectedValueOnce(
      new ValidationFieldError('reply validation failed', [] as any)
    )

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"RD Decline message cannot be processed by member"`
    )
  })

  it('should rethrow any unrecognised error thrown by validating the inbound quote decline', async () => {
    mockRFPValidator.validateInboundQuoteDecline.mockRejectedValueOnce(new Error('reply validation failed'))

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(Error)
    await expect(promise).rejects.not.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"reply validation failed"`)
  })

  it('should succeed to create an rfp reply', async () => {
    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Company Name')
    mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce({} as any)
    mockNotificationClient.createRFPNotification.mockResolvedValueOnce({} as any)

    await useCase.execute(mockMessage)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockMessage.data.response.rfpReply)
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(mockMessage.data.senderStaticID)
    expect(mockNotificationClient.createRFPNotification).toHaveBeenCalledWith(
      mockMessage.context,
      ReplyType.Declined,
      'Receivable discounting quote declined by Company Name',
      tradeFinanceManager.canReadRDRequests.action,
      mockMessage.data.senderStaticID,
      `Receivable discounting quote declined`
    )
    expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
  })

  it('should generate an auto declined rfp reply if there is no response', async () => {
    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Company Name')
    mockNotificationClient.createRFPNotification.mockResolvedValueOnce({} as any)

    delete mockMessage.data.response
    mockMessage.data.senderStaticID = 'sender-static-id'
    mockRFPDataAgent.findByRfpId.mockResolvedValueOnce({ rdId: 'test-rd-id' } as any)

    await useCase.execute(mockMessage)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalled()
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        rdId: 'test-rd-id',
        type: ReplyType.Declined,
        participantId: 'company-static-id',
        senderStaticId: 'sender-static-id',
        autoGenerated: true
      })
    )
    expect(mockReplyDataAgent.findByRdIdAndType).toHaveBeenCalledWith(expect.any(String), ReplyType.Submitted)
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(mockMessage.data.senderStaticID)
    expect(mockNotificationClient.createRFPNotification).toHaveBeenCalledWith(
      mockMessage.context,
      ReplyType.Declined,
      `Receivable discounting request from Company Name expired`,
      tradeFinanceManager.canReadRDRequests.action,
      mockMessage.data.senderStaticID,
      `Receivable discounting request expired`
    )
  })

  it('should fail to generate an auto declined rfp reply if there is no rfp in the database', async () => {
    delete mockMessage.data.response
    mockMessage.data.senderStaticID = 'sender-static-id'
    mockRFPDataAgent.findByRfpId.mockResolvedValueOnce(null as any)

    const promise = useCase.execute(mockMessage)

    await expect(promise).rejects.toThrow(InvalidPayloadProcessingError)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Associated RFP could not be found"`)
  })
})

const buildFakeMessageWithQuote = (overrides: Partial<IQuote> = {}) => {
  const quote = buildFakeQuote(overrides)
  const reply = buildFakeReply()
  const payload = buildFakeResponsePayload(reply, quote)
  const message = buildFakeRFPMessage(payload)
  return message
}
