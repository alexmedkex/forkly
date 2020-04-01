import { buildFakeTrade, buildFakeTradeSnapshot, PaymentTermsEventBase } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { EntityNotFoundError } from '../../errors'

import { GetTradeHistoryUseCase } from './GetTradeHistoryUseCase'

/**
 * This test assumes that the createHistory function is already tested
 */
describe('GetTradeHistoryUseCase', () => {
  let useCase: GetTradeHistoryUseCase
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)

    useCase = new GetTradeHistoryUseCase(mockTradeSnapshotDataAgent)
  })

  describe('success', () => {
    it('should return a history object successfully', async () => {
      const initialTradeUpdatedAt = new Date('2019-05-19T13:00:00Z') // MongoDB returns dates and not strings so the types are wrong but don't change this to string!
      const initialTradeSnapshot = { ...buildFakeTradeSnapshot(), updatedAt: initialTradeUpdatedAt }

      initialTradeSnapshot.trade = buildFakeTrade({
        updatedAt: initialTradeUpdatedAt as any,
        price: 99,
        _id: 'tradeId'
      })

      const updatedTradeUpdatedAt = new Date('2019-05-20T13:00:00Z')
      const updatedTradeSnapshot = { ...initialTradeSnapshot, updatedAt: updatedTradeUpdatedAt }
      updatedTradeSnapshot.trade = { ...initialTradeSnapshot.trade, updatedAt: updatedTradeUpdatedAt as any, price: 55 }
      updatedTradeSnapshot.trade.paymentTerms = {
        ...initialTradeSnapshot.trade.paymentTerms,
        eventBase: PaymentTermsEventBase.Other
      } as any

      mockTradeSnapshotDataAgent.findAllBySourceId.mockResolvedValueOnce([
        initialTradeSnapshot as any,
        updatedTradeSnapshot as any
      ])

      const history = await useCase.execute(initialTradeSnapshot.sourceId)

      expect(history).toEqual({
        historyEntry: {
          trade: {
            id: 'tradeId',
            historyEntry: {
              price: [
                { updatedAt: updatedTradeUpdatedAt, value: updatedTradeSnapshot.trade.price },
                { updatedAt: initialTradeUpdatedAt, value: initialTradeSnapshot.trade.price }
              ],
              paymentTerms: {
                historyEntry: {
                  eventBase: [
                    { updatedAt: updatedTradeUpdatedAt, value: updatedTradeSnapshot.trade.paymentTerms.eventBase },
                    { updatedAt: initialTradeUpdatedAt, value: initialTradeSnapshot.trade.paymentTerms.eventBase }
                  ]
                }
              }
            }
          }
        }
      })
    })
  })

  describe('failures', () => {
    it('should throw EntityNotFoundError if the quote is not found', async () => {
      mockTradeSnapshotDataAgent.findAllBySourceId.mockResolvedValueOnce([])

      await expect(useCase.execute('nonExistentTrade')).rejects.toThrowError(EntityNotFoundError)
    })
  })
})
