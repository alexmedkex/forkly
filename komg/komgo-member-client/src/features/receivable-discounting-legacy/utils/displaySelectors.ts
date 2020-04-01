import {
  RequestType,
  SupportingInstrument,
  FinancialInstrument,
  IFinancialInstrumentInfo,
  DiscountingType,
  InterestType,
  IQuoteBase,
  LiborType,
  IReceivablesDiscountingInfo
} from '@komgo/types'
import { sentenceCase, sentenceCaseWithAcronyms } from '../../../utils/casings'
import { Strings } from '../resources/strings'
import { enumValueToString } from '../resources/enumValueToString'
import * as localMoment from 'moment'

export const displayQuoteInterestType = (quote: IQuoteBase) => {
  if (quote.interestType === InterestType.Libor) {
    return `${sentenceCase(quote.interestType)} - ${sentenceCase(quote.liborType)}`
  }
  return enumValueToString[quote.interestType] || sentenceCase(quote.interestType)
}

export const displayViewQuoteInterestType = (interestType: InterestType, liborType?: LiborType) => {
  if (interestType === InterestType.Libor) {
    return `${sentenceCase(interestType)} - ${sentenceCase(liborType)}`
  }
  return sentenceCase(interestType)
}

export const displayRequestType = (requestType: RequestType, discountingType?: DiscountingType): string => {
  if (requestType === RequestType.Discount) {
    if (discountingType === DiscountingType.WithoutRecourse) {
      return Strings.DiscountWithoutRecourseTitle
    } else if (discountingType === DiscountingType.Blended) {
      return Strings.DiscountBlendedTitle
    } else if (discountingType === DiscountingType.Recourse) {
      return Strings.DiscountWithRecourseTitle
    } else if (!discountingType) {
      return Strings.DiscountTitle
    }
  } else if (requestType === RequestType.RiskCover) {
    return Strings.RiskCoverOnlyTitle
  } else if (requestType === RequestType.RiskCoverDiscounting) {
    return Strings.RiskCoverWithDiscountingOptionTitle
  }

  return 'Undefined'
}

// used to display less specific request type data for use in headings/section titles etc
export const displaySimpleRequestType = (requestType: RequestType): string => {
  if (requestType === RequestType.Discount) {
    return Strings.ReceivableDiscountingSimpleDisplayTitle
  } else if (requestType === RequestType.RiskCover) {
    return Strings.RiskCoverSimpleDisplayTitle
  } else if (requestType === RequestType.RiskCoverDiscounting) {
    return Strings.RiskCoverWithDiscountingOptionTitle
  }

  return Strings.ReceivableDiscountingAndRiskCoverSimpleDisplayTitle
}

export const supportingInstrumentToSentenceList = (supportingInstruments: SupportingInstrument[]): string => {
  const sanitisedSupportingInstruments = []

  // Change to sentence case
  supportingInstruments.forEach((si: string, index) => {
    sanitisedSupportingInstruments.push(sentenceCase(si))
  })

  // Just 1, then return
  if (sanitisedSupportingInstruments.length <= 1) {
    return sanitisedSupportingInstruments.toString()
  }

  // Join in to a list
  const last = sanitisedSupportingInstruments.pop()
  return sanitisedSupportingInstruments.join(', ') + ' and ' + last
}

export const financialInstrumentDisplayValue = (financialInstrumentInfo: IFinancialInstrumentInfo): string => {
  return financialInstrumentInfo.financialInstrument !== FinancialInstrument.Other
    ? sentenceCaseWithAcronyms(financialInstrumentInfo.financialInstrument, ['LC', 'SBLC'])
    : financialInstrumentInfo.financialInstrumentIfOther
}

export const interestTypeDisplayValue = (interestType: InterestType, liborType?: LiborType): string => {
  return interestType !== InterestType.CostOfFunds
    ? `${sentenceCase(interestType)} - ${sentenceCase(liborType)}`
    : sentenceCase(interestType)
}

export const displayMaturity = (value: number): string => {
  if (value === 1) {
    return Strings.Maturity1Day
  }

  if (value === 7) {
    return Strings.Maturity7Days
  }

  if (value === 30) {
    return Strings.Maturity30Days // as moment shows `a month`
  }

  localMoment.relativeTimeThreshold('M', 20) // show `12 months`, instead of `a year`

  return localMoment.duration(value, 'days').humanize()
}
