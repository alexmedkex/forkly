import { buildFakeReceivablesDiscountingExtended, buildFakeReceivablesDiscountingInfo } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { RDInfoAggregator } from '../RDInfoAggregator'

import { GetFilteredRDInfosUseCase } from './GetFilteredRDInfosUseCase'

const mockSavedRD = buildFakeReceivablesDiscountingExtended()

describe('GetFilteredRDInfosUseCase', () => {
  let useCase: GetFilteredRDInfosUseCase
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockRDInfoAggregator: jest.Mocked<RDInfoAggregator>

  beforeEach(() => {
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockRDInfoAggregator = createMockInstance(RDInfoAggregator)

    mockRDDataAgent.create.mockResolvedValue(mockSavedRD)

    useCase = new GetFilteredRDInfosUseCase(mockRDDataAgent, mockRDInfoAggregator)
  })

  describe('execute', () => {
    it('should execute use case successfully with filter.tradeSourceIds', async () => {
      const rdInfo1 = buildFakeReceivablesDiscountingInfo(true, ['p1', 'p2'])
      const rdInfo2 = buildFakeReceivablesDiscountingInfo(true, ['p3', 'p4'])

      mockRDDataAgent.findByTradeSourceIds.mockResolvedValueOnce([rdInfo1.rd, rdInfo2.rd])
      mockRDInfoAggregator.aggregate.mockResolvedValueOnce(rdInfo1).mockResolvedValueOnce(rdInfo2)

      const result = await useCase.execute({ tradeSourceIds: ['123', '234'] })

      expect(result.length).toBe(2)
      expect(result[0]).toBe(rdInfo1)
      expect(result[1]).toBe(rdInfo2)
      expect(mockRDDataAgent.findAll).not.toBeCalled()
    })

    it('should execute use case successfully without filter.tradeSourceIds', async () => {
      const rdInfo1 = buildFakeReceivablesDiscountingInfo(true, ['p1', 'p2'])
      const rdInfo2 = buildFakeReceivablesDiscountingInfo(true, ['p3', 'p4'])

      mockRDDataAgent.findAll.mockResolvedValueOnce([rdInfo1.rd, rdInfo2.rd])
      mockRDInfoAggregator.aggregate.mockResolvedValueOnce(rdInfo1).mockResolvedValueOnce(rdInfo2)

      const result = await useCase.execute({ tradeSourceIds: undefined })

      expect(result.length).toBe(2)
      expect(result[0]).toBe(rdInfo1)
      expect(result[1]).toBe(rdInfo2)
      expect(mockRDDataAgent.findByTradeSourceIds).not.toBeCalled()
    })
  })
})
