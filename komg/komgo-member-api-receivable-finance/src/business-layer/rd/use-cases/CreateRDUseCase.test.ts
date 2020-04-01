import { buildFakeReceivablesDiscountingExtended, buildFakeReceivablesDiscountingBase } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { ReceivablesDiscountingValidator } from '../../validation'

import { CreateRDUseCase } from './CreateRDUseCase'

const rdBase = buildFakeReceivablesDiscountingBase()
const mockSavedRD = buildFakeReceivablesDiscountingExtended()

describe('CreateRDUseCase', () => {
  let useCase: CreateRDUseCase
  let mockRDValidator: jest.Mocked<ReceivablesDiscountingValidator>
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>

  beforeEach(() => {
    mockRDValidator = createMockInstance(ReceivablesDiscountingValidator)
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)

    mockRDDataAgent.create.mockResolvedValue(mockSavedRD)

    useCase = new CreateRDUseCase(mockRDValidator, mockRDDataAgent)
  })

  // This is the only necessary test as all classes are extensively tested on their own and all error cases are handled
  // by the underlying classes. Check coverage for details
  describe('execute', () => {
    it('should execute use case successfully', async () => {
      const result = await useCase.execute(rdBase)

      expect(result.staticId).toEqual(mockSavedRD.staticId)
      expect(mockRDValidator.validate).toHaveBeenCalledTimes(1)
      expect(mockRDDataAgent.create).toHaveBeenCalledTimes(1)
    })
  })
})
