import _ from 'lodash'
import { CURRENCY_SYMBOLS } from '../../../utils/constants'
import Numeral from 'numeral'
import * as i18nIsoCountries from 'i18n-iso-countries'
import { ICreateCreditLineRequest } from '@komgo/types'

import { toDecimalPlaces } from '../../../utils/field-formatters'
import {
  ICreateOrEditCreditLineForm,
  IExtendedCreditLineRequest,
  ICreateOrEditSharedCreditLine,
  IMailToData,
  CreditLineType,
  IRequestCreditLineForm,
  IMemberWithDisabledFlag
} from '../store/types'
import { stringOrNull } from '../../../utils/types'
import { defaultShared } from '../constants'
import { dictionary } from '../dictionary'
import { FlagNameValues } from 'semantic-ui-react'
import { CompanyTableItem } from '../components/common/CounterpartyModalPicker'
import { RowConfig } from '@komgo/ui-components'
import { IMember } from '../../members/store/types'

export const amountWithCurrencyDisplay = (amount: number, currency: string, defaultDisplay = '-') => {
  return amount ? formatAmountWithCurrency(amount, currency) : defaultDisplay
}

export const formatAmountWithCurrency = (amount: number, currency: string) => {
  if (CURRENCY_SYMBOLS[currency]) {
    return `${CURRENCY_SYMBOLS[currency]} ${formatAmountValue(amount)}`
  }
  return `${formatAmountValue(amount)} ${currency}`
}

export const formatAmountValue = (value: number) => {
  return Numeral(value).format('0,0')
}

export const percentFormat = (value, defaultValue = '') => {
  return value || value === 0 ? Numeral(value / 100).format(' % 0.00') : defaultValue
}

export const daysFormat = (value, defaultValue) => {
  return value || value === 0 ? `${value} days` : defaultValue
}

export const formatCreditLineFormValues = (values: ICreateOrEditCreditLineForm): ICreateOrEditCreditLineForm => {
  const newValues = { ...values }
  if (newValues.availabilityAmountUpdatedAt) {
    delete newValues.availabilityAmountUpdatedAt
  }
  if (newValues.data && newValues.data.availabilityReservedUpdatedAt) {
    delete newValues.data.availabilityReservedUpdatedAt
  }
  if (newValues.creditExpiryDate === '') {
    newValues.creditExpiryDate = null
  }
  return {
    ...newValues,
    sharedCreditLines: [
      ...values.sharedCreditLines
        .filter(sharedCreditLine => sharedCreditLine.sharedWithStaticId !== '')
        .map(sharedCreditLine => ({
          ...sharedCreditLine,
          counterpartyStaticId: values.counterpartyStaticId
        }))
    ]
  }
}

export const numberToValueWithDefaultNull = (s: stringOrNull) => (s ? toDecimalPlaces(s) : '')
export const numberToIntegerValueWithDefaultNull = (s: stringOrNull) => (s ? toDecimalPlaces(s, 0) : '')

export const formatToStringDayInputWithDefaultNull = (v: number | null) => (!v && v !== 0 ? '' : Numeral(v).format(''))

export const formatToStringDecimalNumberWithDefaultNull = (v: number | null) =>
  !v && v !== 0 ? '' : Numeral(v).format('0,0.00')

export const formatToIntegerWithDefaultNull = (v: number | null) => (!v && v !== 0 ? '' : Numeral(v).format('0'))

export const cutOutRequestCompaniesThatAreNotDisclosedAnyInfo = (
  values: ICreateOrEditCreditLineForm
): ICreateOrEditCreditLineForm => {
  return {
    ...values,
    sharedCreditLines: values.sharedCreditLines.filter(
      sharedCreditLine =>
        !(sharedCreditLine.requestStaticId && !sharedCreditLine.data.appetite.shared && !sharedCreditLine.staticId)
    )
  }
}

export const generateSharedDataFromRequests = (
  requests: IExtendedCreditLineRequest[]
): ICreateOrEditSharedCreditLine[] => {
  const sharedCreditLines = [
    ...requests.map(request => ({
      ..._.cloneDeep(defaultShared),
      sharedWithStaticId: request.companyStaticId,
      counterpartyStaticId: request.counterpartyStaticId,
      requestStaticId: request.staticId
    })),
    _.cloneDeep(defaultShared)
  ]
  return sharedCreditLines
}

export const prepareRequestInfoData = (
  requestInfoData: IRequestCreditLineForm,
  feature: CreditLineType,
  participantName: string
): { data: ICreateCreditLineRequest; mailToInfo?: IMailToData } => {
  const requestData = { ...requestInfoData }

  let mailToInfo
  if (requestData.mailTo) {
    mailToInfo = {
      email: '',
      subject: dictionary[feature].corporate.createOrEdit.mailToTitle.replace('$participantName', participantName),
      body: requestInfoData.comment
    }
  }
  delete requestData.mailTo

  const { requestForId } = requestData
  delete requestData.requestForId

  const data: ICreateCreditLineRequest = {
    ...requestData,
    counterpartyStaticId: requestForId
  }

  return {
    data,
    mailToInfo
  }
}

export const buildCounterpartyPickerItems = (members: IMember[]): CompanyTableItem[] => {
  i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'))
  return members.map(member => ({
    name: member.x500Name.CN,
    countryName: i18nIsoCountries.getName(member.x500Name.C.trim(), 'en'),
    country: member.x500Name.C.toLocaleLowerCase().trim() as FlagNameValues,
    location: member.x500Name.L,
    id: member.staticId
  }))
}

export const buildCounterpartyRowConfig = (
  members: IMemberWithDisabledFlag[],
  selected: string[]
): Map<string, RowConfig> => {
  const config: Map<string, RowConfig> = new Map()
  members.forEach(member => {
    const configData: RowConfig = {}
    if (member.disabled) {
      configData.disabled = true
    }
    if (selected.includes(member.staticId)) {
      configData.highlighted = true
    }
    config.set(member.staticId, configData)
  })
  return config
}
