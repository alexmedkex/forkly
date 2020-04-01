import {
  buildFakeQuoteBase,
  buildFakeQuote,
  ReplyType,
  buildFakeReceivablesDiscountingExtended,
  IReceivablesDiscounting
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { QuoteDataAgent, ReplyDataAgent, ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { EntityNotFoundError, ValidationFieldError } from '../../errors'
import { QuoteValidator } from '../../validation'

import { UpdateQuoteUseCase } from './UpdateQuoteUseCase'

describe('UpdateQuoteUseCase', () => {
  let usecase: UpdateQuoteUseCase
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockQuoteValidator: jest.Mocked<QuoteValidator>

  let mockRD: IReceivablesDiscounting

  beforeEach(() => {
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockQuoteValidator = createMockInstance(QuoteValidator)

    usecase = new UpdateQuoteUseCase(mockQuoteDataAgent, mockReplyDataAgent, mockRDDataAgent, mockQuoteValidator)

    mockRD = buildFakeReceivablesDiscountingExtended()
    mockRDDataAgent.findByStaticId.mockResolvedValueOnce(mockRD)
  })

  describe('success', () => {
    it('should update a quote successfully', async () => {
      const quoteId = 'quoteId'
      const mockOldQuote = buildFakeQuote()
      const mockUpdatedQuoteBase = buildFakeQuoteBase()
      const mockUpdatedQuote = { ...mockUpdatedQuoteBase, staticId: quoteId, createdAt: '2019-01-01' }

      mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(mockOldQuote)
      mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce({ rdId: mockRD.staticId } as any)
      mockQuoteDataAgent.update.mockResolvedValueOnce(mockUpdatedQuote)

      const result = await usecase.execute(quoteId, mockUpdatedQuoteBase)

      expect(mockRDDataAgent.findByStaticId).toHaveBeenCalledWith(mockRD.staticId)
      expect(mockQuoteValidator.validateFieldsBase).toHaveBeenCalledWith(mockUpdatedQuoteBase, mockRD)
      expect(mockQuoteDataAgent.findByStaticId).toBeCalledWith(quoteId)
      expect(mockReplyDataAgent.findByQuoteIdAndType).toBeCalledWith(quoteId, ReplyType.Accepted)
      expect(mockQuoteDataAgent.update).toBeCalledWith(quoteId, mockUpdatedQuoteBase)
      expect(result).toEqual(expect.objectContaining(mockUpdatedQuote))
    })
  })

  describe('failures', () => {
    it('should throw an EntityNotFoundError if quote is not found', async () => {
      const staticId = 'quoteId'
      const mockUpdatedQuoteBase = buildFakeQuoteBase()

      await expect(usecase.execute(staticId, mockUpdatedQuoteBase)).rejects.toThrowError(EntityNotFoundError)
    })

    it('should throw an ValidationFieldError if RFP Reply is not found', async () => {
      const quoteId = 'quoteId'
      const mockOldQuote = buildFakeQuote()
      const mockUpdatedQuoteBase = buildFakeQuoteBase()

      mockQuoteDataAgent.findByStaticId.mockResolvedValueOnce(mockOldQuote)

      await expect(usecase.execute(quoteId, mockUpdatedQuoteBase)).rejects.toThrowError(ValidationFieldError)

      expect(mockQuoteDataAgent.findByStaticId).toBeCalledWith(quoteId)
      expect(mockReplyDataAgent.findByQuoteIdAndType).toBeCalledWith(quoteId, ReplyType.Accepted)
    })
  })
})
