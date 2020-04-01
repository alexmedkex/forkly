import { buildFakeQuote } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { QuoteDataAgent } from '../../../data-layer/data-agents'
import { EntityNotFoundError } from '../../errors'

import { GetQuoteHistoryUseCase } from './GetQuoteHistoryUseCase'

/**
 * This test assumes that the createHistory function is already tested
 */
describe('GetQuoteHistoryUseCase', () => {
  let useCase: GetQuoteHistoryUseCase
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>

  beforeEach(() => {
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)

    useCase = new GetQuoteHistoryUseCase(mockQuoteDataAgent)
  })

  describe('success', () => {
    it('should return a history object successfully', async () => {
      const initialQuoteUpdatedAt = new Date('2019-05-19T13:00:00Z')
      const initialQuote = { ...buildFakeQuote(), updatedAt: initialQuoteUpdatedAt }

      const updatedQuoteUpdatedAt = new Date('2019-05-20T13:00:00Z')
      const updatedQuote = { ...initialQuote, updatedAt: updatedQuoteUpdatedAt, advanceRate: 66 }

      mockQuoteDataAgent.findAllByStaticId.mockResolvedValueOnce([initialQuote as any, updatedQuote as any])

      const history = await useCase.execute(initialQuote.staticId)

      expect(history).toEqual({
        id: initialQuote.staticId,
        historyEntry: {
          advanceRate: [
            { updatedAt: updatedQuoteUpdatedAt, value: updatedQuote.advanceRate },
            { updatedAt: initialQuoteUpdatedAt, value: initialQuote.advanceRate }
          ]
        }
      })
    })
  })

  describe('failures', () => {
    it('should throw EntityNotFoundError if the quote is not found', async () => {
      mockQuoteDataAgent.findAllByStaticId.mockResolvedValueOnce([])

      await expect(useCase.execute('nonExistentQuote')).rejects.toThrowError(EntityNotFoundError)
    })
  })
})
