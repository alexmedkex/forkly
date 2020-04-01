import { SupportingInstrument, RequestType, DiscountingType } from '@komgo/types'
import { RDInputFieldLogic } from './RDInputFieldLogic'

describe('RDInputFieldLogic', () => {
  describe('shouldShowRiskCoverFields', () => {
    it('should return true for RequestType.RiskCover', () => {
      expect(RDInputFieldLogic.shouldShowRiskCoverFields(RequestType.RiskCover)).toBeTruthy()
    })

    it('should return true for RequestType.RiskCoverDiscounting', () => {
      expect(RDInputFieldLogic.shouldShowRiskCoverFields(RequestType.RiskCoverDiscounting)).toBeTruthy()
    })

    it('should return false for RequestType.Discount and DiscountingType.WithoutRecourse', () => {
      expect(
        RDInputFieldLogic.shouldShowRiskCoverFields(RequestType.Discount, DiscountingType.WithoutRecourse)
      ).toBeFalsy()
    })

    it('should return false for RequestType.Discount and DiscountingType.Recourse', () => {
      expect(RDInputFieldLogic.shouldShowRiskCoverFields(RequestType.Discount, DiscountingType.Recourse)).toBeFalsy()
    })

    it('should return true for RequestType.Discount and DiscountingType.Recourse', () => {
      expect(RDInputFieldLogic.shouldShowRiskCoverFields(RequestType.Discount, DiscountingType.Blended)).toBeTruthy()
    })
  })

  describe('shouldShowDiscountingFields', () => {
    it('should return false for RequestType.RiskCover', () => {
      expect(RDInputFieldLogic.shouldShowDiscountingFields(RequestType.RiskCover)).toBeFalsy()
    })

    it('should return true for RequestType.RiskCoverDiscounting', () => {
      expect(RDInputFieldLogic.shouldShowDiscountingFields(RequestType.RiskCoverDiscounting)).toBeTruthy()
    })

    it('should return true for RequestType.Discount', () => {
      expect(RDInputFieldLogic.shouldShowDiscountingFields(RequestType.Discount)).toBeTruthy()
    })
  })
})
