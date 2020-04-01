import { RequestType, DiscountingType } from '@komgo/types'

export class QuoteInputFieldLogic {
  public static shouldShowRiskCoverFields(requestType: RequestType, discountingType?: DiscountingType): boolean {
    if (requestType === RequestType.Discount && discountingType === DiscountingType.Blended) {
      return true
    }

    return requestType !== RequestType.Discount
  }

  public static shouldShowDiscountingFields(requestType: RequestType): boolean {
    return requestType !== RequestType.RiskCover
  }

  public static shouldShowInterestTypeFields(requestType: RequestType): boolean {
    return requestType !== RequestType.RiskCover
  }

  private constructor() {}
}
