import {
  RequestType,
  buildFakeQuote,
  DiscountingType,
  IQuote,
  buildFakeReceivablesDiscountingExtended,
  IReceivablesDiscounting,
  buildFakeQuoteBase,
  IQuoteBase
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent } from '../../data-layer/data-agents'
import { ValidationFieldError } from '../errors'

import { QuoteValidator } from './QuoteValidator'

describe('QuoteValidator', () => {
  let quoteValidator: QuoteValidator
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>

  let mockRD: IReceivablesDiscounting

  beforeEach(() => {
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)

    quoteValidator = new QuoteValidator(mockRDDataAgent)
  })

  describe('findRDAndValidate', () => {
    let quote: IQuote

    beforeEach(() => {
      quote = buildFakeQuote({}, false, RequestType.Discount, DiscountingType.WithoutRecourse)
      mockRD = buildFakeReceivablesDiscountingExtended()

      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(mockRD)
    })

    it('passes validation', async () => {
      await quoteValidator.findRDAndValidate(mockRD.staticId, quote)

      expect(mockRDDataAgent.findByStaticId).toHaveBeenCalledWith(mockRD.staticId)
    })
  })

  describe('validateFieldsBase', () => {
    let quote: IQuoteBase

    beforeEach(() => {
      quote = buildFakeQuoteBase({}, RequestType.RiskCover)
    })

    it('passes validation: no discountingType', async () => {
      const rd: any = {
        requestType: RequestType.RiskCover
      }

      await quoteValidator.validateFieldsBase(quote, rd)
      // will not throw if it passes
    })

    it('passes validation: with discountingType', async () => {
      const rd: any = {
        requestType: RequestType.Discount,
        discountingType: DiscountingType.WithoutRecourse
      }
      const newQuote = buildFakeQuoteBase({}, rd.requestType, rd.discountingType)

      await quoteValidator.validateFieldsBase(newQuote, rd)
      // will not throw if it passes
    })

    it('fails validation and throws ValidationFieldError when json schema validation fails', async () => {
      const rd: any = {
        requestType: RequestType.RiskCover
      }
      delete quote.advanceRate

      try {
        await quoteValidator.validateFieldsBase(quote, rd)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.validationErrors).toMatchObject({
          advanceRate: [`should have required property 'advanceRate'`]
        })
      }
    })
  })

  describe('validateFieldsExtended', () => {
    let quote: IQuote

    beforeEach(() => {
      quote = buildFakeQuote({}, false, RequestType.RiskCover)
    })

    it('passes validation: no discountingType', async () => {
      const rd: any = {
        requestType: RequestType.RiskCover
      }

      await quoteValidator.validateFieldsExtended(quote, rd)
      // will not throw if it passes
    })

    it('passes validation: with discountingType', async () => {
      const rd: any = {
        requestType: RequestType.Discount,
        discountingType: DiscountingType.WithoutRecourse
      }
      const newQuote = buildFakeQuote({}, false, rd.requestType, rd.discountingType)

      await quoteValidator.validateFieldsExtended(newQuote, rd)
      // will not throw if it passes
    })

    it('fails validation and throws ValidationFieldError when json schema validation fails', async () => {
      const rd: any = {
        requestType: RequestType.RiskCover
      }
      quote.staticId = 'invalidStaticId'

      try {
        await quoteValidator.validateFieldsExtended(quote, rd)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.validationErrors).toMatchObject({
          staticId: [`'staticId' should match format "uuid"`]
        })
      }
    })
  })
})
