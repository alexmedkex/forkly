import { tradeFinanceManager } from '@komgo/permissions'
import {
  buildFakeQuote,
  ReplyType,
  buildFakeReceivablesDiscountingExtended,
  IReceivablesDiscounting
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { QuoteDataAgent, ReplyDataAgent, ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { InvalidPayloadProcessingError } from '../../errors'
import { buildFakeRFPMessage, buildFakeResponsePayload } from '../../messaging/faker'
import { TaskClient, CompanyRegistryClient, NotificationClient } from '../../microservice-clients'
import { TaskType } from '../../types'
import { RFPValidator, QuoteValidator } from '../../validation'

import { ReceiveResponseMessageUseCase } from './ReceiveResponseMessageUseCase'

const mockRFPReplySubmit = buildFakeReply({ type: ReplyType.Submitted })
const mockRFPReplyReject = buildFakeReply({ type: ReplyType.Reject })
const mockQuote = buildFakeQuote()

describe('ReceiveResponseMessageUseCase', () => {
  let useCase: ReceiveResponseMessageUseCase
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockTaskClient: jest.Mocked<TaskClient>
  let mockNotificationClient: jest.Mocked<NotificationClient>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockQuoteValidator: jest.Mocked<QuoteValidator>

  beforeEach(() => {
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockTaskClient = createMockInstance(TaskClient)
    mockNotificationClient = createMockInstance(NotificationClient)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)
    mockRFPValidator = createMockInstance(RFPValidator)
    mockQuoteValidator = createMockInstance(QuoteValidator)

    useCase = new ReceiveResponseMessageUseCase(
      mockQuoteDataAgent,
      mockReplyDataAgent,
      mockTaskClient,
      mockNotificationClient,
      mockCompanyRegistryClient,
      mockRFPValidator,
      mockQuoteValidator
    )
  })

  it('should execute use case successfully for RFP.Response', async () => {
    const message = buildResponseMessage()
    const emailData = mockTaskClient.resolveTaskEmail('Receivable discounting quote submission received from Company')
    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockImplementationOnce(() => Promise.resolve('Company'))

    await useCase.execute(message)

    expect(mockQuoteValidator.findRDAndValidate).toHaveBeenCalledWith(mockRFPReplySubmit.rdId, mockQuote)
    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockRFPReplySubmit)
    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledWith(mockQuote)
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockRFPReplySubmit)

    // Should sent a task
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(message.data.senderStaticID)
    expect(mockTaskClient.createTaskRequest).toHaveBeenCalledWith(
      TaskType.ResponseTaskType,
      'Receivable discounting quote submission received',
      message.data.senderStaticID,
      tradeFinanceManager.canReadRD.action,
      message.context,
      emailData
    )
    expect(mockTaskClient.sendTask).toHaveBeenCalled()
  })

  it('should not fail if there is a duplicate RFP Response', async () => {
    const message = buildResponseMessage()
    const emailData = mockTaskClient.resolveTaskEmail('Receivable discounting quote submission received from Company')
    mockReplyDataAgent.findByStaticId.mockResolvedValueOnce(mockRFPReplySubmit)

    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockImplementationOnce(() => Promise.resolve('Company'))

    await useCase.execute(message)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockRFPReplySubmit)
    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledWith(mockQuote)
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockRFPReplySubmit)

    // Should sent a task
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(message.data.senderStaticID)
    expect(mockTaskClient.createTaskRequest).toHaveBeenCalledWith(
      TaskType.ResponseTaskType,
      'Receivable discounting quote submission received',
      message.data.senderStaticID,
      tradeFinanceManager.canReadRD.action,
      message.context,
      emailData
    )
    expect(mockTaskClient.sendTask).toHaveBeenCalled()
  })

  it('should execute use case successfully for RFP.Reject', async () => {
    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Company Name')
    const message = buildRejectMessage()

    await useCase.execute(message)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockRFPReplyReject)
    expect(mockQuoteDataAgent.updateCreate).not.toHaveBeenCalled()
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockRFPReplyReject)

    // Should sent a notification
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(message.data.senderStaticID)
    expect(mockNotificationClient.createRFPNotification).toHaveBeenCalledWith(
      message.context,
      ReplyType.Reject,
      'Receivable discounting request for proposal rejected by Company Name',
      tradeFinanceManager.canReadRD.action,
      message.data.senderStaticID,
      `Receivable discounting request for proposal rejected`
    )
    expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
  })

  it('should throw InvalidPayloadProcessingError if a RFP.Response doesnt have quote', async () => {
    const message = buildResponseMessage()
    delete message.data.response.quote

    await expect(useCase.execute(message)).rejects.toThrow(InvalidPayloadProcessingError)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).not.toHaveBeenCalled()
    expect(mockQuoteDataAgent.updateCreate).not.toHaveBeenCalled()
    expect(mockReplyDataAgent.updateCreate).not.toHaveBeenCalled()
  })

  it('should ignore quote if is a RFP.Reject ', async () => {
    const message = buildRejectMessage()
    message.data.response.quote = mockQuote

    await useCase.execute(message)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalledWith(mockRFPReplyReject)
    expect(mockQuoteDataAgent.updateCreate).not.toHaveBeenCalled()
    expect(mockReplyDataAgent.updateCreate).toHaveBeenCalledWith(mockRFPReplyReject)
  })

  it('should throw same error if a error is thrown in other data agents', async () => {
    const message = buildResponseMessage()
    mockQuoteDataAgent.updateCreate.mockRejectedValueOnce(new Error('message'))

    await expect(useCase.execute(message)).rejects.toThrow(Error)

    expect(mockRFPValidator.validateRFPReplyNotProcessed).toHaveBeenCalled()
    expect(mockQuoteDataAgent.updateCreate).toHaveBeenCalledTimes(1)
    expect(mockReplyDataAgent.updateCreate).not.toHaveBeenCalled()
  })

  function buildResponseMessage() {
    const payload = buildFakeResponsePayload(mockRFPReplySubmit, mockQuote)
    return buildFakeRFPMessage(payload)
  }

  function buildRejectMessage() {
    const payload = buildFakeResponsePayload(mockRFPReplyReject)
    return buildFakeRFPMessage(payload)
  }
})
