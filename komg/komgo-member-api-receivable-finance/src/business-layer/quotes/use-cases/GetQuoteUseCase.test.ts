import { buildFakeQuote } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { QuoteDataAgent } from '../../../data-layer/data-agents'
import { EntityNotFoundError } from '../../errors'

import { GetQuoteUseCase } from './GetQuoteUseCase'

const mockQuote = buildFakeQuote()

describe('GetQuoteUseCase', () => {
  let useCase: GetQuoteUseCase
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>

  beforeEach(() => {
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)

    useCase = new GetQuoteUseCase(mockQuoteDataAgent)
  })

  describe('success', () => {
    it('should execute use case successfully', async () => {
      mockQuoteDataAgent.findByStaticId.mockResolvedValue(mockQuote)

      const result = await useCase.execute('quoteId')
      expect(result).toEqual(mockQuote)
    })
  })

  describe('failures', () => {
    it('should fail with EntityNotFoundError if quote is not found', async () => {
      await expect(useCase.execute('quoteId')).rejects.toThrowError(EntityNotFoundError)
    })
  })
})
