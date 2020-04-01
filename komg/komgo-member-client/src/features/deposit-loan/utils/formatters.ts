import { Currency, DepositLoanPeriod } from '@komgo/types'
import _ from 'lodash'

import {
  IRequestDepositLoanInformationForm,
  CreditAppetiteDepositLoanFeature,
  DepositLoanDetailsQuery,
  ICreateDepositLoanRequest,
  IExtendRequestDepositLoan,
  ISharedDepositLoanForm,
  IExtendedDepositLoanResponse,
  IDepositLoanForm
} from '../store/types'
import { IMailToData } from '../../credit-line/store/types'
import { dictionary } from '../dictionary'
import { getCurrencyWithTenor } from './selectors'
import { defaultShared } from '../constants'

export const createCurrencyAndPeriodObjFromString = (currencyAndPeriod: string) => {
  const [currency, period, periodDuration] = currencyAndPeriod.split('/')
  return {
    currency: currency as Currency,
    period: period as DepositLoanPeriod,
    periodDuration: periodDuration ? parseInt(periodDuration, 10) : undefined
  }
}

export const createCurrencyAndPeriodStringValue = (currencyAndPeriod: DepositLoanDetailsQuery) => {
  if (currencyAndPeriod.periodDuration) {
    return `${currencyAndPeriod.currency}/${currencyAndPeriod.period}/${currencyAndPeriod.periodDuration}`
  }
  return `${currencyAndPeriod.currency}/${currencyAndPeriod.period}`
}

export const formatRequestInfoData = (
  requestInfoData: IRequestDepositLoanInformationForm,
  feature: CreditAppetiteDepositLoanFeature
): { data: ICreateDepositLoanRequest; mailToInfo?: IMailToData } => {
  const data = { ...requestInfoData }

  const currencyAndTenorObj = createCurrencyAndPeriodObjFromString(data.requestForId)
  delete data.requestForId

  let mailToInfo
  if (data.mailTo) {
    mailToInfo = {
      email: '',
      subject: dictionary[feature].corporate.createOrEdit.mailToTitle.replace(
        '$currencyAndTenor',
        getCurrencyWithTenor(currencyAndTenorObj)
      ),
      body: requestInfoData.comment
    }
  }
  delete data.mailTo

  return {
    data: {
      ...data,
      ...currencyAndTenorObj
    },
    mailToInfo
  }
}

export const groupRequestByCurrencyAndPeriodStringValue = (
  requests: IExtendRequestDepositLoan[]
): { [currencyAndTenor: string]: IExtendRequestDepositLoan[] } => {
  const grouped = _.groupBy(requests, request => request.currencyAndTenorStringValue)
  return grouped
}

export const generateSharedDataFromRequests = (requests: IExtendRequestDepositLoan[]): ISharedDepositLoanForm[] => {
  const fromRequest = [
    ...requests.map(request => ({
      ..._.cloneDeep(defaultShared),
      sharedWithCompanyName: request.companyName,
      sharedWithStaticId: request.companyStaticId,
      requestStaticId: request.staticId
    })),
    _.cloneDeep(defaultShared)
  ]
  return fromRequest
}

export const generateSharedDataFromRequestWhenDepositLoanExists = (
  requests: IExtendRequestDepositLoan[],
  depositLoan: IExtendedDepositLoanResponse
): ISharedDepositLoanForm[] => {
  const sharedThatExistsInRequests = depositLoan.sharedWith.filter(sharedData => {
    let exists = false
    requests.forEach(request => {
      if (request.companyStaticId === sharedData.sharedWithStaticId) {
        exists = true
      }
    })
    return exists
  })

  const sharedThatNotExistsInRequests = depositLoan.sharedWith.filter(sharedData => {
    let exists = true
    requests.forEach(request => {
      if (request.companyStaticId === sharedData.sharedWithStaticId) {
        exists = false
      }
    })
    return exists
  })

  const requestsThatNotExistInSharedInfo = requests.filter(request => {
    let notExists = true
    depositLoan.sharedWith.forEach(sharedData => {
      if (request.companyStaticId === sharedData.sharedWithStaticId) {
        notExists = false
      }
    })
    return notExists
  })

  return [
    // Requests that not exists in shared data
    ...requestsThatNotExistInSharedInfo.map(request => ({
      ..._.cloneDeep(defaultShared),
      sharedWithCompanyName: request.companyName,
      sharedWithStaticId: request.companyStaticId,
      requestStaticId: request.staticId
    })),

    // Data that exists in shared info and in requests
    ...sharedThatExistsInRequests.map(shared => {
      const request = requests.find(request => request.companyStaticId === shared.sharedWithStaticId)
      return {
        ...shared,
        requestStaticId: request.staticId
      }
    }),

    // Shared data that not exist in requests
    ...sharedThatNotExistsInRequests,

    // Default one empty
    _.cloneDeep(defaultShared)
  ]
}

export const filterOutSharedDepositLoanData = (values: IDepositLoanForm): IDepositLoanForm => {
  return {
    ...values,
    sharedWith: values.sharedWith.filter(
      sharedDepositLoan =>
        !(sharedDepositLoan.requestStaticId && !sharedDepositLoan.appetite.shared && !sharedDepositLoan.staticId)
    )
  }
}
