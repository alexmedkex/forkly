import { InterestType, FeeCalculationType, PricingType } from '@komgo/types'
import { Strings } from './strings'

export const enumValueToString = {
  [PricingType.AllIn]: Strings.AllInPricing,
  [InterestType.CostOfFunds]: Strings.IndicativeCostOfFundsTitle,
  [InterestType.AddOnLibor]: Strings.AddOnOverLiborTitle,
  [FeeCalculationType.Straight]: Strings.StraightDiscount,
  [FeeCalculationType.Yield]: Strings.DiscountToYield,
  [FeeCalculationType.Other]: Strings.OtherFormula
}
