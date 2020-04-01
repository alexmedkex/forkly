import {
  Currency,
  IHistoryEntry,
  IReceivablesDiscounting,
  IHistoryChange,
  InvoiceType,
  IHistory,
  IFinancialInstrumentInfo,
  FinancialInstrument
} from '@komgo/types'
import { displayQuantity, displayYesOrNo, displayPercentage } from '../../trades/utils/displaySelectors'
import { displayDate, isLaterThan } from '../../../utils/date'
import { capitalize, sentenceCase } from '../../../utils/casings'
import { supportingInstrumentToSentenceList } from '../utils/displaySelectors'
import { isEmpty } from 'lodash'
import { maturityLabels } from '../utils/constants'

type AnyChange = IHistoryChange<any>
export interface IFormattedValues {
  updatedAt: string
  values: string[]
}

export const INVOICE_AMOUNT: keyof IReceivablesDiscounting = 'invoiceAmount'
export const INVOICE_TYPE: keyof IReceivablesDiscounting = 'invoiceType'
export const FINANCIAL_INSTRUMENT_INFO: string = 'financialInstrumentInfo'
export const FINANCIAL_INSTRUMENT: string = 'financialInstrumentInfo.financialInstrument'
export const FINANCIAL_INSTRUMENT_IF_OTHER: string = 'financialInstrumentInfo.financialInstrumentIfOther'

const MIN_POSSIBLE_HISTORY = 2

const onlyInvoiceAmountChanged = (changes: AnyChange[], rd: IReceivablesDiscounting): IFormattedValues[] =>
  changes.map(change => ({
    updatedAt: displayDate(change.updatedAt),
    values: [displayQuantity(change.value, rd.currency), capitalize(rd.invoiceType)]
  }))

const onlyInvoiceTypeChanged = (changes: AnyChange[], rd: IReceivablesDiscounting): IFormattedValues[] =>
  changes.map(invoiceType => ({
    updatedAt: displayDate(invoiceType.updatedAt),
    values: [displayQuantity(rd.invoiceAmount, rd.currency), capitalize(invoiceType.value)]
  }))

const addType = (entryHistory: AnyChange[], type: keyof IReceivablesDiscounting) =>
  entryHistory ? entryHistory.map(item => ({ ...item, type })) : []

const sortEntriesAscending = (a: AnyChange, b: AnyChange) => (isLaterThan(a.updatedAt, b.updatedAt) ? 1 : -1) // ASC
const sortEntriesDescending = (a: AnyChange, b: AnyChange) => (isLaterThan(a.updatedAt, b.updatedAt) ? -1 : 1) // DSC

const bothInvoiceTypeAndAmountChanged = (
  invoiceAmountHistory,
  invoiceTypeHistory,
  rd: IReceivablesDiscounting
): IFormattedValues[] => {
  const histories = [...invoiceAmountHistory, ...invoiceTypeHistory].sort(sortEntriesAscending)

  const mergedHistories: IFormattedValues[] = []

  let currentInvoiceAmount: AnyChange = invoiceAmountHistory[0]
  let currentInvoiceType: AnyChange = invoiceTypeHistory[0]
  let historyIndex = 0
  for (const history of histories) {
    if (history.type === INVOICE_AMOUNT) {
      currentInvoiceAmount = history
    } else {
      currentInvoiceType = history
    }
    if (
      historyIndex > 0 &&
      new Date(history.updatedAt).getTime() === new Date(histories[historyIndex - 1].updatedAt).getTime()
    ) {
      const valueIndex = history.type === INVOICE_AMOUNT ? 0 : 1
      const valueToMerge =
        history.type === INVOICE_AMOUNT
          ? formatFieldValue(currentInvoiceAmount, INVOICE_AMOUNT, rd.currency)
          : formatFieldValue(currentInvoiceType, INVOICE_TYPE, rd.currency)
      mergedHistories[mergedHistories.length - 1].values[valueIndex] = valueToMerge
    } else {
      mergedHistories.push({
        updatedAt: displayDate(
          history.type === INVOICE_AMOUNT ? currentInvoiceAmount.updatedAt : currentInvoiceType.updatedAt
        ),
        values: [
          formatFieldValue(currentInvoiceAmount, INVOICE_AMOUNT, rd.currency),
          formatFieldValue(currentInvoiceType, INVOICE_TYPE, rd.currency)
        ]
      })
    }
    historyIndex++
  }

  return mergedHistories.reverse()
}

export const shouldShowHistory = (fieldName: string, history: IHistory<IReceivablesDiscounting>) => {
  const fieldHasHistory = (fieldName: string) => !isEmpty(history) && getHistoryEntry(fieldName, history).length > 0

  switch (fieldName) {
    case INVOICE_AMOUNT:
      return fieldHasHistory(INVOICE_AMOUNT) || fieldHasHistory(INVOICE_TYPE)
    case FINANCIAL_INSTRUMENT:
      return fieldHasHistory(FINANCIAL_INSTRUMENT) || fieldHasHistory(FINANCIAL_INSTRUMENT_IF_OTHER)
    default:
      return fieldHasHistory(fieldName)
  }
}

export const formatMergedInvoiceAmount = (
  history: IHistoryEntry<IReceivablesDiscounting>,
  rd: IReceivablesDiscounting
): IFormattedValues[] => {
  const invoiceAmountHistory = addType(history.invoiceAmount as Array<IHistoryChange<number>>, INVOICE_AMOUNT)
  const invoiceTypeHistory = addType(history.invoiceType as Array<IHistoryChange<InvoiceType>>, INVOICE_TYPE)

  if (invoiceAmountHistory.length < MIN_POSSIBLE_HISTORY) {
    return onlyInvoiceTypeChanged(invoiceTypeHistory.sort(sortEntriesAscending), rd).reverse()
  } else if (invoiceTypeHistory.length < MIN_POSSIBLE_HISTORY) {
    return onlyInvoiceAmountChanged(invoiceAmountHistory.sort(sortEntriesAscending), rd).reverse()
  } else {
    return bothInvoiceTypeAndAmountChanged(invoiceAmountHistory, invoiceTypeHistory, rd)
  }
}

export const formatFinancialInstrument = (history: IHistory<IFinancialInstrumentInfo>): IFormattedValues[] => {
  if (!history || !history.historyEntry) {
    return []
  }

  const financialInstrumentChanges = history.historyEntry.financialInstrument as AnyChange[]
  let otherChanges = history.historyEntry.financialInstrumentIfOther as AnyChange[]

  if (!financialInstrumentChanges || financialInstrumentChanges.length === 0) {
    return formatRdHistory(FINANCIAL_INSTRUMENT, otherChanges.sort(sortEntriesDescending))
  }

  if (!otherChanges || otherChanges.length === 0) {
    return formatRdHistory(FINANCIAL_INSTRUMENT, financialInstrumentChanges.sort(sortEntriesDescending))
  }

  const allChanges: AnyChange[] = []

  financialInstrumentChanges.forEach(change => {
    const filteredOtherChanges = otherChanges.filter(o => o.updatedAt === change.updatedAt)

    if (filteredOtherChanges.length > 0) {
      allChanges.push(filteredOtherChanges[0])
      otherChanges = otherChanges.filter(o => o.updatedAt !== change.updatedAt)
    } else {
      allChanges.push(change)
    }
  })

  return formatRdHistory(FINANCIAL_INSTRUMENT, allChanges.concat(otherChanges).sort(sortEntriesDescending))
}

export const formatRdHistory = (
  fieldName: string,
  historyChanges: AnyChange[],
  currency?: Currency
): IFormattedValues[] => {
  return historyChanges.map((change: AnyChange) => ({
    updatedAt: displayDate(change.updatedAt),
    values: [formatFieldValue(change, fieldName, currency)]
  }))
}

/**
 * Automatically search for nested fields
 *
 * NOTE: it doesn't support Arrays
 */
export const getHistoryEntry = (fieldName: string, history: IHistory<any>): AnyChange[] => {
  if (!history || !history.historyEntry) {
    return []
  }

  // if single one, return
  if (!fieldName.includes('.')) {
    const historyEntry = history.historyEntry[fieldName] as Array<IHistoryChange<any>>
    return historyEntry ? historyEntry : []
  }

  const nestingProperties = fieldName.split('.')
  const parentHistoryEntry = history.historyEntry[nestingProperties[0]] as IHistory<any>

  // if there is not history, return empty
  if (!parentHistoryEntry) {
    return []
  }

  const nestedPath = nestingProperties.slice(1).join('.')
  return getHistoryEntry(nestedPath, parentHistoryEntry)
}

export const formatAgreedTermsHistory = formatRdHistory

const formatFieldValue = (field: AnyChange, fieldName: string, currency?: Currency): string => {
  for (const formatter of formatters) {
    const value = formatter(field, fieldName, currency)
    if (value) {
      return value
    }
  }
}

const formatters = [
  formatEmptyArray,
  formatEmptyArray,
  formatMonetaryValues,
  formatDateValues,
  formatCapitalizedValues,
  formatPercentages,
  formatYesNoValues,
  formatfinancialInstrument,
  formatDaysUntilMaturity,
  formatSupportingInstruments,
  formatDays,
  noFormat
]

function formatEmptyArray(field: AnyChange, fieldName: string, currency?: Currency) {
  // If value is an Array, but empty, we want to return some kind of history.
  if (isEmptyArray(field.value)) {
    return '(Empty)'
  }
}

const isEmptyArray = (fieldValue: any): boolean => {
  return fieldValue && fieldValue.constructor && fieldValue.constructor === Array && fieldValue.length === 0
}

function formatMonetaryValues(field: AnyChange, fieldName: string, currency?: Currency) {
  const monetaryValues = ['invoiceAmount', 'pricingFlatFeeAmount']

  if (monetaryValues.includes(fieldName)) {
    return displayQuantity(field.value, currency)
  }
}

function formatDateValues(field: AnyChange, fieldName: string, currency?: Currency) {
  const dates = ['discountingDate', 'dateOfPerformance', 'riskCoverDate']
  if (dates.includes(fieldName)) {
    return displayDate(field.value)
  }
}

function formatCapitalizedValues(field: AnyChange, fieldName: string, currency?: Currency) {
  const capitalized = ['invoiceType']
  if (capitalized.includes(fieldName)) {
    return capitalize(field.value)
  }
}

function formatPercentages(field: AnyChange, fieldName: string, currency?: Currency) {
  const percentages = [
    'advancedRate',
    'advanceRate',
    'pricingAllIn',
    'pricingRiskFee',
    'pricingMargin',
    'indicativeCof'
  ]
  if (percentages.includes(fieldName)) {
    return displayPercentage(field.value)
  }
}

function formatYesNoValues(field: AnyChange, fieldName: string, currency?: Currency) {
  const yesNo = ['titleTransfer']

  if (yesNo.includes(fieldName)) {
    return displayYesOrNo(field.value)
  }
}

function formatfinancialInstrument(field: AnyChange, fieldName: string, currency?: Currency) {
  if (fieldName === 'financialInstrumentInfo.financialInstrument') {
    return Object.values(FinancialInstrument).includes(field.value) ? sentenceCase(field.value) : field.value
  }
}

function formatDaysUntilMaturity(field: AnyChange, fieldName: string, currency?: Currency) {
  if (fieldName === 'daysUntilMaturity') {
    return maturityLabels[field.value]
  }
}

function formatSupportingInstruments(field: AnyChange, fieldName: string, currency?: Currency) {
  if (fieldName === 'supportingInstruments') {
    return supportingInstrumentToSentenceList(field.value)
  }
}

function formatDays(field: AnyChange, fieldName: string, currency?: Currency) {
  const days = ['numberOfDaysDiscounting', 'numberOfDaysRiskCover']
  if (days.includes(fieldName)) {
    return `${field.value} days`
  }
}

function noFormat(field: AnyChange, fieldName: string, currency?: Currency) {
  return field.value
}
