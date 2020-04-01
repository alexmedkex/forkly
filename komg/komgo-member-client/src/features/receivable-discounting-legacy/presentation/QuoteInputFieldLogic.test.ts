import { RequestType, DiscountingType } from '@komgo/types'
import { QuoteInputFieldLogic } from './QuoteInputFieldLogic'

describe('QuoteInputFieldLogic', () => {
  describe('shouldShowRiskCoverFields', () => {
    it('should return true for RequestType.RiskCover', () => {
      expect(QuoteInputFieldLogic.shouldShowRiskCoverFields(RequestType.RiskCover)).toBeTruthy()
    })

    it('should return true for RequestType.RiskCoverDiscounting', () => {
      expect(QuoteInputFieldLogic.shouldShowRiskCoverFields(RequestType.RiskCoverDiscounting)).toBeTruthy()
    })

    it('should return false for RequestType.Discount and DiscountingType.WithoutRecourse', () => {
      expect(
        QuoteInputFieldLogic.shouldShowRiskCoverFields(RequestType.Discount, DiscountingType.WithoutRecourse)
      ).toBeFalsy()
    })

    it('should return false for RequestType.Discount and DiscountingType.Recourse', () => {
      expect(QuoteInputFieldLogic.shouldShowRiskCoverFields(RequestType.Discount, DiscountingType.Recourse)).toBeFalsy()
    })

    it('should return true for RequestType.Discount and DiscountingType.Recourse', () => {
      expect(QuoteInputFieldLogic.shouldShowRiskCoverFields(RequestType.Discount, DiscountingType.Blended)).toBeTruthy()
    })
  })

  describe('shouldShowDiscountingFields', () => {
    it('should return false for RequestType.RiskCover', () => {
      expect(QuoteInputFieldLogic.shouldShowDiscountingFields(RequestType.RiskCover)).toBeFalsy()
    })

    it('should return true for RequestType.RiskCoverDiscounting', () => {
      expect(QuoteInputFieldLogic.shouldShowDiscountingFields(RequestType.RiskCoverDiscounting)).toBeTruthy()
    })

    it('should return true for RequestType.Discount', () => {
      expect(QuoteInputFieldLogic.shouldShowDiscountingFields(RequestType.Discount)).toBeTruthy()
    })
  })

  describe('shouldShowInterestTypeFields', () => {
    it('should return false for RequestType.RiskCover', () => {
      expect(QuoteInputFieldLogic.shouldShowInterestTypeFields(RequestType.RiskCover)).toBeFalsy()
    })

    it('should return true for RequestType.RiskCoverDiscounting', () => {
      expect(QuoteInputFieldLogic.shouldShowInterestTypeFields(RequestType.RiskCoverDiscounting)).toBeTruthy()
    })

    it('should return true for RequestType.Discount', () => {
      expect(QuoteInputFieldLogic.shouldShowInterestTypeFields(RequestType.Discount)).toBeTruthy()
    })
  })
})
