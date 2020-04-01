import { cloneDeep } from 'lodash'
import {
  PricingType,
  InterestType,
  IReceivablesDiscountingBase,
  SupportingInstrument,
  FinancialInstrument,
  IQuoteBase,
  RequestType,
  LiborType
} from '@komgo/types'

/**
 * Sanitize the object being sent for submit depending on the data on it, to avoid formik changes
 * @param values IReceivablesDiscountingBase to be used for submit
 */
export const sanitizeReceivableDiscontingForSubmit = (valuesForSubmit: IReceivablesDiscountingBase) => {
  const values = cloneDeep(valuesForSubmit)

  if (values.requestType !== RequestType.Discount) {
    delete values.discountingType
  }

  if (values.supportingInstruments.includes(SupportingInstrument.FinancialInstrument)) {
    values.financialInstrumentInfo = replaceEmptyStringsWithUndefined(values.financialInstrumentInfo)
    if (values.financialInstrumentInfo.financialInstrument !== FinancialInstrument.Other) {
      delete values.financialInstrumentInfo.financialInstrumentIfOther
    }
  } else {
    delete values.financialInstrumentInfo
  }

  if (!values.supportingInstruments.includes(SupportingInstrument.ParentCompanyGuarantee)) {
    delete values.guarantor
  }

  return replaceEmptyStringsWithUndefined(values)
}

export const sanitizeReceivableDiscontingForValidation = (valuesForValidation: IReceivablesDiscountingBase) => {
  return sanitizeReceivableDiscontingForSubmit(valuesForValidation)
}

export const sanitizeQuoteForSubmit = (values: IQuoteBase) => {
  return cleanPricingAndInterestTypes(values)
}

export const sanitizeQuoteForValidation = (values: IQuoteBase) => {
  return sanitizeQuoteForSubmit(values)
}

// Deletes field values that are not part of the selected form
export const cleanPricingAndInterestTypes = (values: IQuoteBase) => {
  const newValues = cloneDeep(values)

  if (values.pricingType === PricingType.AllIn) {
    delete newValues.pricingMargin
    delete newValues.pricingRiskFee
    delete newValues.pricingFlatFeeAmount
  } else if (values.pricingType === PricingType.Split) {
    delete newValues.pricingAllIn
    delete newValues.pricingFlatFeeAmount
  } else if (values.pricingType === PricingType.FlatFee) {
    delete newValues.pricingAllIn
    delete newValues.pricingMargin
    delete newValues.pricingRiskFee
  } else if (values.pricingType === PricingType.RiskFee || values.pricingType === PricingType.Margin) {
    delete newValues.pricingFlatFeeAmount
  }

  if (values.interestType === InterestType.CostOfFunds) {
    delete newValues.liborType
    delete newValues.addOnValue
  }
  if (values.interestType === InterestType.Libor) {
    delete newValues.indicativeCof
    delete newValues.addOnValue
  }
  if (values.interestType === InterestType.AddOnLibor) {
    delete newValues.indicativeCof
  }

  if (values.liborType !== LiborType.Published) {
    delete newValues.daysUntilMaturity
  }

  return replaceEmptyStringsWithUndefined(newValues)
}

export const replaceEmptyStringsWithUndefined = (values: any) => {
  const entries = Object.entries(values).map(([key, value]) => [value === '' ? undefined : value, key])
  const cleaned = entries.reduce(
    (memo: any, [value, key]: any) => ({
      ...memo,
      [key]: isObject(value) ? replaceEmptyStringsWithUndefined(value) : value
    }),
    {}
  )
  return cleaned
}

export const removeEmptyEntries = <T extends object = object>(obj: T): Partial<T> =>
  Object.keys(obj)
    .filter(key => obj[key] != null && obj[key] !== '')
    .reduce(
      (memo: object, key: string) => ({
        ...memo,
        [key]: obj[key]
      }),
      {}
    )

export const removeUndefinedOrNull = <T extends object = object>(obj: T): Partial<T> =>
  Object.keys(obj)
    .filter(key => obj[key] != null)
    .reduce(
      (memo: object, key: string) => ({
        ...memo,
        [key]: obj[key]
      }),
      {}
    )

function isObject(value: any) {
  return value && value !== null && typeof value === 'object' && !Array.isArray(value)
}
