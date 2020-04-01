import { tradeFinanceManager } from '@komgo/permissions'
import { buildFakeReceivablesDiscountingExtended, buildFakeTradeSnapshot } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, RFPDataAgent, TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { IRFPRequest } from '../../../data-layer/models/rfp/IRFPRequestDocument'
import { InvalidPayloadProcessingError } from '../../errors'
import { buildFakeRFPMessage, buildFakeRequestPayload } from '../../messaging/faker'
import { TaskClient, CompanyRegistryClient } from '../../microservice-clients'
import { TaskType } from '../../types'

import { ReceiveRequestMessageUseCase } from './ReceiveRequestMessageUseCase'

const mockRD = buildFakeReceivablesDiscountingExtended()
const mockTradeSnapshot = buildFakeTradeSnapshot()

describe('ReceiveRequestMessageUseCase', () => {
  let useCase: ReceiveRequestMessageUseCase
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockRFPDataAgent: jest.Mocked<RFPDataAgent>
  let mockTaskClient: jest.Mocked<TaskClient>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>

  beforeEach(() => {
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockRFPDataAgent = createMockInstance(RFPDataAgent)
    mockTaskClient = createMockInstance(TaskClient)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)

    useCase = new ReceiveRequestMessageUseCase(
      mockRDDataAgent,
      mockTradeSnapshotDataAgent,
      mockRFPDataAgent,
      mockTaskClient,
      mockCompanyRegistryClient
    )
  })

  it('should execute use case successfully', async () => {
    const message = buildMessage()
    const expectedSavedRFPRequest: IRFPRequest = {
      rdId: mockRD.staticId,
      rfpId: message.data.rfpId,
      participantStaticIds: [],
      senderStaticId: message.data.senderStaticID,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }

    const emailData = mockTaskClient.resolveTaskEmail('Receivable discounting request received from Company')

    mockCompanyRegistryClient.getCompanyNameFromStaticId.mockImplementationOnce(() => Promise.resolve('Company'))

    await useCase.execute(message)

    expect(mockRDDataAgent.updateCreate).toHaveBeenCalledWith(mockRD)
    expect(mockTradeSnapshotDataAgent.updateCreate).toHaveBeenCalledWith(mockTradeSnapshot)
    expect(mockRFPDataAgent.updateCreate).toHaveBeenCalledWith(expectedSavedRFPRequest)
    expect(mockCompanyRegistryClient.getCompanyNameFromStaticId).toHaveBeenCalledWith(message.data.senderStaticID)
    expect(mockTaskClient.createTaskRequest).toHaveBeenCalledWith(
      TaskType.RequestTaskType,
      'Receivable discounting request received',
      message.data.senderStaticID,
      tradeFinanceManager.canReadRDRequests.action,
      message.context,
      emailData
    )
    expect(mockTaskClient.sendTask).toHaveBeenCalled()
  })

  it('should not throw if there is a duplicate RD', async () => {
    const message = buildMessage()
    const expectedSavedRFPRequest: IRFPRequest = {
      rdId: mockRD.staticId,
      rfpId: message.data.rfpId,
      participantStaticIds: [],
      senderStaticId: message.data.senderStaticID,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }

    mockRDDataAgent.findByStaticId.mockResolvedValueOnce(message.data.productRequest.rd)

    await useCase.execute(message)

    expect(mockRDDataAgent.updateCreate).toHaveBeenCalledWith(mockRD)
    expect(mockTradeSnapshotDataAgent.updateCreate).toHaveBeenCalledWith(mockTradeSnapshot)
    expect(mockRFPDataAgent.updateCreate).toHaveBeenCalledWith(expectedSavedRFPRequest)
  })

  it('should throw InvalidPayloadProcessingError if there is a RD with a different createdAt', async () => {
    const message = buildMessage()

    const existingRD = { ...message.data.productRequest.rd, createdAt: Date.now().toString() }
    mockRDDataAgent.findByStaticId.mockResolvedValueOnce(existingRD)

    await expect(useCase.execute(message)).rejects.toThrow(InvalidPayloadProcessingError)

    expect(mockRDDataAgent.updateCreate).not.toHaveBeenCalled()
    expect(mockTradeSnapshotDataAgent.updateCreate).not.toHaveBeenCalled()
    expect(mockRFPDataAgent.updateCreate).not.toHaveBeenCalled()
  })

  function buildMessage() {
    const payload = buildFakeRequestPayload(mockRD, mockTradeSnapshot, true)
    const message = buildFakeRFPMessage(payload)
    return message
  }
})
