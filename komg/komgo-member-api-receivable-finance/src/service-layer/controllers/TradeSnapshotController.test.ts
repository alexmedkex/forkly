import { ErrorCode } from '@komgo/error-utilities'
import { IHistory, ITradeSnapshot } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { EntityNotFoundError } from '../../business-layer/errors'
import { GetTradeHistoryUseCase } from '../../business-layer/trade-snapshot/use-cases'

import { TradeSnapshotController } from './TradeSnapshotController'

describe('TradeSnapshotController', () => {
  let controller: TradeSnapshotController
  let mockGetTradeHistoryUseCase: jest.Mocked<GetTradeHistoryUseCase>

  beforeEach(() => {
    mockGetTradeHistoryUseCase = createMockInstance(GetTradeHistoryUseCase)

    controller = new TradeSnapshotController(mockGetTradeHistoryUseCase)
  })

  describe('getHistory', () => {
    const quoteId = 'quoteId'

    it('should get the trade snapshot history successfully', async () => {
      const expectedHistory: IHistory<ITradeSnapshot> = {
        id: undefined,
        historyEntry: {
          trade: {
            id: 'tradeId',
            historyEntry: {
              price: [
                {
                  updatedAt: 'myDate',
                  value: 1000
                },
                {
                  updatedAt: 'myDate2',
                  value: 1200
                }
              ]
            }
          }
        }
      }
      mockGetTradeHistoryUseCase.execute.mockResolvedValueOnce(expectedHistory)
      const result = await controller.getHistory(quoteId)

      expect(mockGetTradeHistoryUseCase.execute).toHaveBeenCalled()
      expect(result).toEqual(expectedHistory)
    })

    it('should fail with ValidationInvalidOperation and 404 status if GetQuoteHistoryUseCase throws EntityNotFoundError', async () => {
      mockGetTradeHistoryUseCase.execute.mockRejectedValueOnce(new EntityNotFoundError('msg'))

      try {
        await controller.getHistory(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(404)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })

    it('should fail with UnexpectedError and 500 status if GetQuoteHistoryUseCase throws an untyped error', async () => {
      mockGetTradeHistoryUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.getHistory(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })
})
