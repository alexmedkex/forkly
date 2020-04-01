import { buildFakeReceivablesDiscountingBase, IReceivablesDiscounting, RequestType } from '@komgo/types'
import 'reflect-metadata'

import { MOCK_DATE } from '../../../integration-tests/utils/test-utils'
import { ValidationFieldError } from '../errors'

import { AddDiscountingValidator } from '.'

describe('AddDiscountingValidator', () => {
  let addDiscountingValidator: AddDiscountingValidator

  let rd: IReceivablesDiscounting

  beforeEach(() => {
    rd = {
      ...buildFakeReceivablesDiscountingBase(true, {
        requestType: RequestType.RiskCoverDiscounting,
        numberOfDaysRiskCover: 50,
        riskCoverDate: MOCK_DATE
      }),
      staticId: 'staticId'
    }

    addDiscountingValidator = new AddDiscountingValidator()
  })

  describe('validate', () => {
    it('passes validation ', async () => {
      addDiscountingValidator.validate(rd)
      // will not throw if it passes
    })

    it('fails validation and throws ValidationFieldError when missing mandatory discounting fields', async () => {
      expect.assertions(2)

      delete rd.discountingDate
      delete rd.numberOfDaysDiscounting

      try {
        addDiscountingValidator.validate(rd)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFieldError)
        expect(e.validationErrors).toEqual({
          discountingDate: ["should have required property 'discountingDate'"],
          numberOfDaysDiscounting: ["should have required property 'numberOfDaysDiscounting'"]
        })
      }
    })

    it('fails validation and throws ValidationFieldError when missing mandatory discounting and risk cover fields', async () => {
      expect.assertions(2)

      delete rd.numberOfDaysRiskCover
      delete rd.riskCoverDate
      delete rd.discountingDate
      delete rd.numberOfDaysDiscounting

      try {
        addDiscountingValidator.validate(rd)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFieldError)
        expect(e.validationErrors).toEqual({
          discountingDate: ["should have required property 'discountingDate'"],
          numberOfDaysDiscounting: ["should have required property 'numberOfDaysDiscounting'"],
          numberOfDaysRiskCover: ["should have required property 'numberOfDaysRiskCover'"],
          riskCoverDate: ["should have required property 'riskCoverDate'"]
        })
      }
    })

    it('fails validation and throws ValidationFieldError when requestType is not RiskCoverDiscouting', async () => {
      expect.assertions(2)

      rd.requestType = RequestType.RiskCover

      try {
        addDiscountingValidator.validate(rd)
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFieldError)
        expect(e.validationErrors).toEqual({
          requestType: ["'requestType' should be equal to constant (RISK_COVER_DISCOUNTING)"]
        })
      }
    })
  })
})
