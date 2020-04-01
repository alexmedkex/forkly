import { buildFakeReceivablesDiscountingExtended, buildFakeTrade } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, RFPDataAgent, TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { TradeCargoClient, RFPClient } from '../../microservice-clients'
import { RFPValidator } from '../../validation'

import { CreateRFPRequestUseCase } from './CreateRFPRequestUseCase'

const mockRD = buildFakeReceivablesDiscountingExtended()
const mockTrade = {
  _id: 'tradeId'
}
const mockMovements = [
  {
    _id: 'movementId0'
  },
  {
    _id: 'movementId1'
  }
]
const mockRfpResponse = {
  staticId: 'rfpId',
  actionStatuses: []
}

describe('CreateRFPRequestUseCase', () => {
  let useCase: CreateRFPRequestUseCase
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockTradeCargoClient: jest.Mocked<TradeCargoClient>
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockRFPClient: jest.Mocked<RFPClient>
  let mockRFPDataAgent: jest.Mocked<RFPDataAgent>

  beforeEach(() => {
    mockRFPValidator = createMockInstance(RFPValidator)
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockTradeCargoClient = createMockInstance(TradeCargoClient)
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockRFPClient = createMockInstance(RFPClient)
    mockRFPDataAgent = createMockInstance(RFPDataAgent)

    mockRDDataAgent.findByStaticId.mockResolvedValue(mockRD)
    mockTradeCargoClient.getTrade.mockResolvedValue(mockTrade)
    mockTradeCargoClient.getMovements.mockResolvedValue(mockMovements)
    mockRFPClient.postRFPRequest.mockResolvedValue(mockRfpResponse)

    useCase = new CreateRFPRequestUseCase(
      mockRFPValidator,
      mockRDDataAgent,
      mockTradeCargoClient,
      mockTradeSnapshotDataAgent,
      mockRFPClient,
      mockRFPDataAgent
    )
  })

  // This is the only necessary test as all classes are extensively tested on their own and all error cases are handled
  // by the underlying classes. Check coverage for details
  describe('execute', () => {
    it('should execute use case successfully', async () => {
      const result = await useCase.execute({
        rdId: 'rdId',
        participantStaticIds: []
      })

      expect(result).toEqual(mockRfpResponse)
      expect(mockRFPValidator.validateRequest).toHaveBeenCalledTimes(1)
      expect(mockRDDataAgent.findByStaticId).toHaveBeenCalledTimes(1)
      expect(mockTradeCargoClient.getTrade).toHaveBeenCalledTimes(1)
      expect(mockTradeCargoClient.getMovements).toHaveBeenCalledTimes(1)
      expect(mockTradeSnapshotDataAgent.updateCreate).toHaveBeenCalledTimes(1)
      expect(mockRFPClient.postRFPRequest).toHaveBeenCalledTimes(1)
      expect(mockRFPDataAgent.create).toHaveBeenCalledTimes(1)
    })

    it('should send the saved trade snapshot', async () => {
      const snapshot = buildFakeTrade()
      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot as any)

      await useCase.execute({
        rdId: 'rdId',
        participantStaticIds: []
      })

      expect(mockRFPClient.postRFPRequest).toHaveBeenCalled()
      expect(mockRFPClient.postRFPRequest.mock.calls[0][0].rfp.productRequest.trade).toEqual(snapshot)
    })
  })
})
