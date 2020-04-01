import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { EntityNotFoundError } from '../../errors'

import { GetRDHistoryUseCase } from './GetRDHistoryUseCase'

/**
 * This test assumes that the createHistory function is already tested
 */
describe('GetRDHistoryUseCase', () => {
  let useCase: GetRDHistoryUseCase
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>

  beforeEach(() => {
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    useCase = new GetRDHistoryUseCase(mockRDDataAgent)
  })

  describe('execute', () => {
    it('should return a history object', async () => {
      const initialRD = {
        ...buildFakeReceivablesDiscountingExtended(),
        discountingDate: new Date('2019-06-01T13:00:00Z'), // MongoDB returns dates and not strings so the types are wrong but don't change this to string!
        updatedAt: new Date('2019-05-19T13:00:00Z')
      }

      const updateRD = {
        ...initialRD,
        discountingDate: new Date('2019-07-01T13:00:00Z'),
        invoiceAmount: initialRD.invoiceAmount + 100,
        updatedAt: new Date('2019-05-20T14:00:00Z')
      }

      // returns in ascending updatedAt order
      mockRDDataAgent.findAllByStaticId.mockResolvedValue([initialRD as any, updateRD as any])

      const rdHistory = await useCase.execute('rdId')

      expect(rdHistory).toEqual({
        id: initialRD.staticId,
        historyEntry: {
          discountingDate: [
            { updatedAt: updateRD.updatedAt, value: updateRD.discountingDate },
            { updatedAt: initialRD.updatedAt, value: initialRD.discountingDate }
          ],
          invoiceAmount: [
            { updatedAt: updateRD.updatedAt, value: updateRD.invoiceAmount },
            { updatedAt: initialRD.updatedAt, value: initialRD.invoiceAmount }
          ]
        }
      })
    })

    it('throws an error if the the RD is not found', async () => {
      mockRDDataAgent.findAllByStaticId.mockResolvedValueOnce([])

      await expect(useCase.execute('rdId')).rejects.toThrowError(EntityNotFoundError)
    })
  })
})
