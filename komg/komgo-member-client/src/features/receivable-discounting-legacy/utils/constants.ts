import {
  Currency,
  InvoiceType,
  QUOTE_SCHEMA,
  RECEIVABLES_DISCOUNTING_SCHEMA,
  FinancialInstrument,
  IQuoteBase
} from '@komgo/types'
import { RequestType } from '@komgo/types/dist/receivables-discounting/models/RequestType'
import { DiscountingType } from '@komgo/types/dist/receivables-discounting/models/DiscountingType'
import { SchemaUtils } from './SchemaUtils'
import { IRadioButtonWithDescription } from '../../../components/form/radio-button-group-with-descriptions/RadioButtonGroupWithDescriptions'
import { displayRequestType, displayMaturity } from './displaySelectors'
import { Strings } from '../resources/strings'
import { QuoteInputFieldLogic } from '../presentation/QuoteInputFieldLogic'

// TODO: move to komgo/types
export enum ReceivablesDiscountingRole {
  Trader = 'TRADER',
  Bank = 'BANK'
}

export enum DiscountingDateType {
  Expected = 'EXPECTED',
  Discounted = 'DISCOUNTED'
}

export enum ReceivableDiscountingViewPanels {
  TradeSummary = 'TRADE_SUMMARY',
  ReceivableDiscountingData = 'RECEIVABLE_DISCOUNTING DATA',
  SubmittedQuote = 'SUBMITTED_QUOTE',
  AcceptedQuote = 'ACCEPTED_QUOTE',
  Documents = 'DOCUMENTS'
}

export enum ApplyForDiscountingPanels {
  TradeSummary = 'TRADE_SUMMARY',
  ApplyForDiscountingData = 'APPLY_FOR_DISCOUNTING_DATA'
}

export enum ReceivableDiscountingModal {
  Submit = 'SUBMIT',
  Decline = 'DECLINE'
}

export const initialFinancialInstrumentInfo = {
  financialInstrument: FinancialInstrument.SBLC,
  financialInstrumentIssuerName: '',
  financialInstrumentIfOther: ''
}

export const RD_DEFAULT_VERSION = 2
// Needs to be type `any` based on some validation between fields of type number.
export const initialApplyForDiscountingData = (requestType?: RequestType, discountingType?: DiscountingType): any => {
  if (!requestType) {
    // return default object if no requestType is selected
    return { supportingInstruments: [] }
  } else {
    return {
      version: RD_DEFAULT_VERSION,
      tradeReference: { sourceId: '', sellerEtrmId: '', source: '' },
      requestType,
      discountingType: discountingType ? discountingType : DiscountingType.WithoutRecourse,
      invoiceAmount: 0,
      currency: Currency.USD,
      invoiceType: InvoiceType.Indicative,
      supportingInstruments: [],
      advancedRate: undefined,
      dateOfPerformance: undefined,
      discountingDate: requestType === RequestType.Discount ? '' : undefined,
      numberOfDaysDiscounting: requestType === RequestType.Discount ? ('' as any) : undefined,
      riskCoverDate:
        requestType !== RequestType.Discount || discountingType === DiscountingType.Blended ? '' : undefined,
      numberOfDaysRiskCover:
        requestType !== RequestType.Discount || discountingType === DiscountingType.Blended ? '' : undefined,
      guarantor: '',
      financialInstrumentInfo: initialFinancialInstrumentInfo,
      comment: undefined
    }
  }
}

// Needs to be type `any` based on some validation between fields of type number.
export const initialSubmitQuoteData = (
  rdCurrency: Currency,
  requestType: RequestType,
  discountingType?: DiscountingType
): any => {
  const quoteDefaultValue = (fieldName: string, defaultValue?: any) =>
    SchemaUtils.findDefaultValue(QUOTE_SCHEMA, fieldName, requestType, discountingType) || defaultValue

  const baseFields = {
    advanceRate: quoteDefaultValue('advanceRate', ''),
    pricingType: quoteDefaultValue('pricingType', ''),
    comment: quoteDefaultValue('comment', ''),
    pricingAllIn: quoteDefaultValue('pricingAllIn', ''),
    pricingRiskFee: quoteDefaultValue('pricingRiskFee', ''),
    pricingMargin: quoteDefaultValue('pricingMargin', ''),
    pricingFlatFeeAmount: quoteDefaultValue('pricingFlatFeeAmount', {
      amount: 0,
      currency: rdCurrency
    })
  }

  const riskCoverFields = {
    numberOfDaysRiskCover: quoteDefaultValue('numberOfDaysRiskCover', '')
  }

  const discountingFields = {
    numberOfDaysDiscounting: quoteDefaultValue('numberOfDaysDiscounting', '')
  }

  const interestFields = {
    interestType: quoteDefaultValue('interestType', ''),
    addOnValue: quoteDefaultValue('addOnValue', ''),
    indicativeCof: quoteDefaultValue('indicativeCof', ''),
    feeCalculationType: quoteDefaultValue('feeCalculationType', ''),
    liborType: quoteDefaultValue('liborType', ''),
    daysUntilMaturity: quoteDefaultValue('daysUntilMaturity', '')
  }

  let initialValues = baseFields

  if (QuoteInputFieldLogic.shouldShowDiscountingFields(requestType)) {
    initialValues = { ...initialValues, ...discountingFields }
  }

  if (QuoteInputFieldLogic.shouldShowRiskCoverFields(requestType, discountingType)) {
    initialValues = { ...initialValues, ...riskCoverFields }
  }

  if (QuoteInputFieldLogic.shouldShowInterestTypeFields(requestType)) {
    initialValues = { ...initialValues, ...interestFields }
  }

  return initialValues
}

export const initialAcceptQuoteData = (
  quote: IQuoteBase,
  rdCurrency: Currency,
  requestType: RequestType,
  discountingType?: DiscountingType
): any => {
  const quoteDefaultValue = (fieldName: string, defaultValue?: any) => quote[fieldName] || defaultValue

  const baseFields = {
    advanceRate: quoteDefaultValue('advanceRate', ''),
    pricingType: quoteDefaultValue('pricingType', ''),
    comment: quoteDefaultValue('comment', ''),
    pricingAllIn: quoteDefaultValue('pricingAllIn', ''),
    pricingRiskFee: quoteDefaultValue('pricingRiskFee', ''),
    pricingMargin: quoteDefaultValue('pricingMargin', ''),
    pricingFlatFeeAmount: quoteDefaultValue('pricingFlatFeeAmount', {
      amount: 0,
      currency: rdCurrency
    })
  }

  const riskCoverFields = {
    numberOfDaysRiskCover: quoteDefaultValue('numberOfDaysRiskCover', '')
  }

  const discountingFields = {
    numberOfDaysDiscounting: quoteDefaultValue('numberOfDaysDiscounting', '')
  }

  const interestFields = {
    interestType: quoteDefaultValue('interestType', ''),
    addOnValue: quoteDefaultValue('addOnValue', ''),
    indicativeCof: quoteDefaultValue('indicativeCof', ''),
    feeCalculationType: quoteDefaultValue('feeCalculationType', ''),
    liborType: quoteDefaultValue('liborType', ''),
    daysUntilMaturity: quoteDefaultValue('daysUntilMaturity', '')
  }

  let initialValues = baseFields

  if (QuoteInputFieldLogic.shouldShowDiscountingFields(requestType)) {
    initialValues = { ...initialValues, ...discountingFields }
  }

  if (QuoteInputFieldLogic.shouldShowRiskCoverFields(requestType, discountingType)) {
    initialValues = { ...initialValues, ...riskCoverFields }
  }

  if (QuoteInputFieldLogic.shouldShowInterestTypeFields(requestType)) {
    initialValues = { ...initialValues, ...interestFields }
  }

  return initialValues
}

export const initialBankDeclineRFPData: any = {
  comment: ''
}

export interface IMemberMarketSelection {
  provider: string
}

export const rdDiscountingSchema = RECEIVABLES_DISCOUNTING_SCHEMA
export const rdQuoteSchema = QUOTE_SCHEMA

export const ONE_MONTH_MATURITY_DAYS = 30
export const authorizedMaturityValues = [
  1,
  7,
  ONE_MONTH_MATURITY_DAYS,
  ONE_MONTH_MATURITY_DAYS * 2,
  ONE_MONTH_MATURITY_DAYS * 3,
  ONE_MONTH_MATURITY_DAYS * 6,
  ONE_MONTH_MATURITY_DAYS * 12
]
export const maturityLabels = authorizedMaturityValues
  .map(v => ({ [`${v}`]: displayMaturity(v) }))
  .reduce((p, c) => ({ ...p, ...c }), {})

export const applyForDiscountingRadioButtonOptions: IRadioButtonWithDescription[] = [
  {
    value: RequestType.RiskCover,
    label: displayRequestType(RequestType.RiskCover),
    description: Strings.RiskCoverDescription
  },
  {
    value: RequestType.RiskCoverDiscounting,
    label: displayRequestType(RequestType.RiskCoverDiscounting),
    description: Strings.RiskCoverReceivableDiscountingDescription
  },
  {
    value: RequestType.Discount,
    label: displayRequestType(RequestType.Discount),
    description: Strings.ReceivableDiscountingDescription
  }
]

export enum ReturnContext {
  RDViewRequest = 'rdViewRequest',
  TradeDashboard = 'tradeDashboard'
}
