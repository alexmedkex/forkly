import { buildFakeReceivablesDiscountingExtended, buildFakeReceivablesDiscountingInfo } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { RDInfoAggregator } from '../RDInfoAggregator'

import { GetRDInfoUseCase } from './GetRDInfoUseCase'

const mockRD = buildFakeReceivablesDiscountingExtended()
const mockRDInfo = buildFakeReceivablesDiscountingInfo()

describe('GetRDInfoUseCase', () => {
  let useCase: GetRDInfoUseCase
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockRDInfoAggregator: jest.Mocked<RDInfoAggregator>

  beforeEach(() => {
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockRDInfoAggregator = createMockInstance(RDInfoAggregator)

    mockRDDataAgent.findByStaticId.mockResolvedValue(mockRD)
    mockRDInfoAggregator.aggregate.mockResolvedValue(mockRDInfo)

    useCase = new GetRDInfoUseCase(mockRDDataAgent, mockRDInfoAggregator)
  })

  // This is the only necessary test as all classes are extensively tested on their own and all error cases are handled
  // by the underlying classes. Check coverage for details
  describe('execute', () => {
    it('should execute use case successfully', async () => {
      const result = await useCase.execute('rdId')
      expect(result).toEqual(mockRDInfo)
    })
  })
})
