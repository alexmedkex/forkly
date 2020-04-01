import { buildFakeReceivablesDiscountingBase, IReceivablesDiscounting } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent } from '../../data-layer/data-agents'
import { ValidationDuplicateError, ValidationFieldError } from '../errors'

import { ReceivablesDiscountingValidator } from './ReceivablesDiscountingValidator'

describe('ReceivablesDiscountingValidator', () => {
  let rdValidator: ReceivablesDiscountingValidator
  let mockRdAgent: jest.Mocked<ReceivablesDiscountingDataAgent>

  let rdBase: IReceivablesDiscounting

  beforeEach(() => {
    mockRdAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    rdBase = { ...buildFakeReceivablesDiscountingBase(), staticId: 'staticId' }

    rdValidator = new ReceivablesDiscountingValidator(mockRdAgent)
  })

  describe('validate', () => {
    it('passes validation ', async () => {
      mockRdAgent.findByTrade.mockResolvedValueOnce(null)

      await rdValidator.validate(rdBase)
      // will not throw if it passes
    })

    it('fails validation and throws ValidationDuplicateError if the RD data already exists', async () => {
      expect.assertions(1)

      mockRdAgent.findByTrade.mockResolvedValueOnce(rdBase)

      try {
        await rdValidator.validate(rdBase)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationDuplicateError)
      }
    })

    it('fails validation and throws ValidationFieldError when json schema validation fails', async () => {
      expect.assertions(2)

      rdBase.tradeReference.sourceId = ''
      rdBase.tradeReference.sellerEtrmId = ''
      rdBase.tradeReference.sellerEtrmId = ''
      rdBase.dateOfPerformance = 'invalidDate'
      rdBase.discountingDate = 'invalidDate'
      rdBase.riskCoverDate = 'invalidDate'

      mockRdAgent.findByTrade.mockResolvedValueOnce(null)

      try {
        await rdValidator.validate(rdBase)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFieldError)
        expect(e.validationErrors).toMatchObject({
          discountingDate: [`'discountingDate' should match format "date"`],
          dateOfPerformance: [`'dateOfPerformance' should match format "date"`],
          'tradeReference.sourceId': [`'tradeReference.sourceId' should not be empty`],
          'tradeReference.sellerEtrmId': [`'tradeReference.sellerEtrmId' should not be empty`]
        })
      }
    })

    it('fails validation and throws ValidationFieldError when an invalid requestType is used', async () => {
      expect.assertions(2)
      rdBase.requestType = 'invalid'
      mockRdAgent.findByTrade.mockResolvedValueOnce(null)

      try {
        await rdValidator.validate(rdBase)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFieldError)
        expect(e.validationErrors).toMatchObject({
          requestType: [
            // tslint:disable-next-line: quotemark
            "'requestType' should be equal to one of the allowed values (RISK_COVER or RISK_COVER_DISCOUNTING or DISCOUNT)"
          ]
        })
      }
    })

    it('fails validation and throws ValidationFieldError when tradeReference is not present', async () => {
      expect.assertions(2)

      delete rdBase.tradeReference

      mockRdAgent.findByTrade.mockResolvedValueOnce(null)

      try {
        await rdValidator.validate(rdBase)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFieldError)
        expect(e.validationErrors).toMatchObject({ tradeReference: [`should have required property 'tradeReference'`] })
      }
    })
  })
})
