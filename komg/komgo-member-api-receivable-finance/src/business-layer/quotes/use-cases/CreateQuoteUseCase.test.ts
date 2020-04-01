import { buildFakeQuoteBase, buildFakeQuote } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { QuoteDataAgent } from '../../../data-layer/data-agents'

import { CreateQuoteUseCase } from './CreateQuoteUseCase'

const quoteBase = buildFakeQuoteBase()
const quote = buildFakeQuote()

describe('CreateQuoteUseCase', () => {
  let useCase: CreateQuoteUseCase
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>

  beforeEach(() => {
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)

    mockQuoteDataAgent.create.mockResolvedValueOnce(quote)

    useCase = new CreateQuoteUseCase(mockQuoteDataAgent)
  })

  // This is the only necessary test as all classes are extensively tested on their own and all error cases are handled
  // by the underlying classes. Check coverage for details
  describe('execute', () => {
    it('should execute use case successfully', async () => {
      const result = await useCase.execute(quoteBase)

      expect(result).toEqual(quote.staticId)
    })
  })
})
