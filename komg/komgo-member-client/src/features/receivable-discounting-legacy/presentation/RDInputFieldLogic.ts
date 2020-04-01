import {
  RequestType,
  DiscountingType,
  SupportingInstrument,
  IFinancialInstrumentInfo,
  FinancialInstrument
} from '@komgo/types'

export class RDInputFieldLogic {
  public static shouldShowRiskCoverFields(requestType: RequestType, discountingType?: DiscountingType): boolean {
    if (requestType === RequestType.Discount && discountingType === DiscountingType.Blended) {
      return true
    }

    return requestType !== RequestType.Discount
  }

  public static shouldShowDiscountingFields(requestType: RequestType): boolean {
    return requestType !== RequestType.RiskCover
  }

  public static shouldShowDiscountingTypeField(requestType: RequestType): boolean {
    return requestType === RequestType.Discount
  }

  public static shouldShowGuarantor(supportingInstruments: SupportingInstrument[]): boolean {
    return supportingInstruments.includes(SupportingInstrument.ParentCompanyGuarantee)
  }

  public static shouldShowFinancialInstrumentFields(supportingInstruments: SupportingInstrument[]): boolean {
    return supportingInstruments.includes(SupportingInstrument.FinancialInstrument)
  }

  public static shouldShowFinancialInstrumentOtherField(
    supportingInstruments: SupportingInstrument[],
    financialInstrumentInfo?: IFinancialInstrumentInfo
  ): boolean {
    return (
      supportingInstruments.includes(SupportingInstrument.FinancialInstrument) &&
      financialInstrumentInfo &&
      financialInstrumentInfo.financialInstrument === FinancialInstrument.Other
    )
  }

  private constructor() {}
}
