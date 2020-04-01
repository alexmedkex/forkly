import { IDepositLoanResponse, IDisclosedDepositLoanSummary, IDisclosedDepositLoan } from '@komgo/types'
import {
  IExtendedDepositLoanResponse,
  ICurrencyAndTenor,
  IExtendedDisclosedDepositLoanSummary,
  DepositLoanDetailsQuery,
  IExtendedDisclosedDepositLoan,
  IDepositLoanRequestDocument,
  IExtendRequestDepositLoan
} from '../store/types'
import { findCounterpartyByStatic } from '../../letter-of-credit-legacy/utils/selectors'
import { Counterparty } from '../../counterparties/store/types'
import { getCompanyName } from '../../counterparties/utils/selectors'
import { createCurrencyAndPeriodStringValue } from './formatters'

export const getCurrencyWithTenor = (depositLoan: IDepositLoanResponse | ICurrencyAndTenor) => {
  const periodText =
    depositLoan.periodDuration === 1 ? depositLoan.period.toLowerCase().slice(0, -1) : depositLoan.period.toLowerCase()
  return `${depositLoan.currency}${depositLoan.periodDuration ? ` ${depositLoan.periodDuration}` : ''} ${periodText}`
}

export const populateDepoistLoanWithSharedCompanyName = (
  depositLoan: IDepositLoanResponse,
  counterparties: Counterparty[]
): IExtendedDepositLoanResponse => {
  return {
    ...depositLoan,
    sharedWith: depositLoan.sharedWith.map(shared => {
      const company = findCounterpartyByStatic(counterparties, shared.sharedWithStaticId)
      return {
        ...shared,
        sharedWithCompanyName: company ? getCompanyName(company) : '-'
      }
    })
  }
}

export const populateDepositLoansWithCurrencyAndTenorInfo = (
  depositLoans: IDepositLoanResponse[]
): IExtendedDepositLoanResponse[] => {
  return depositLoans.map(depositLoan => populateDepositLoanWithCurrencyAndTenor(depositLoan))
}

export const populateDepositLoanWithCurrencyAndTenor = (
  depositLoan: IDepositLoanResponse
): IExtendedDepositLoanResponse => {
  return {
    ...depositLoan,
    currencyAndTenor: getCurrencyWithTenor(depositLoan)
  }
}

export const findDepositLoanBasedOnCurrencyPeriodAndPeriodDuration = (
  disclosedItems: IDepositLoanResponse[],
  params: DepositLoanDetailsQuery
): IDepositLoanResponse => {
  return disclosedItems.find(
    item =>
      item.currency === params.currency &&
      item.period === params.period &&
      item.periodDuration === params.periodDuration
  )
}

export const populateDisclosedDepositLoanSummariesWithCurrencyAndTenorInfo = (
  summaries: IDisclosedDepositLoanSummary[]
): IExtendedDisclosedDepositLoanSummary[] => {
  return summaries.map(summary => populateDisclosedDepositLoanSummaryWithCurrencyAndTenor(summary))
}

export const populateDisclosedDepositLoanSummaryWithCurrencyAndTenor = (
  summary: IDisclosedDepositLoanSummary
): IExtendedDisclosedDepositLoanSummary => {
  return {
    ...summary,
    currencyAndTenor: getCurrencyWithTenor(summary)
  }
}

export const filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration = (
  disclosedItems: IDisclosedDepositLoan[],
  params: DepositLoanDetailsQuery
): IDisclosedDepositLoan[] => {
  return disclosedItems.filter(
    item =>
      item.currency === params.currency &&
      item.period === params.period &&
      item.periodDuration === (params.periodDuration === undefined ? null : params.periodDuration)
  )
}

export const populateDisclosedDepositsLoansWithCompanyName = (
  disclosedItems: IDisclosedDepositLoan[],
  counterparties: Counterparty[]
): IExtendedDisclosedDepositLoan[] => {
  return disclosedItems.map(item => {
    const company = findCounterpartyByStatic(counterparties, item.ownerStaticId)
    return {
      ...item,
      companyName: company ? getCompanyName(company) : '-',
      companyLocation: company && company.x500Name ? company.x500Name.L : '-'
    }
  })
}

export const filterAndExtendDisclosedDepositLoan = (
  disclosedItems: IDisclosedDepositLoan[],
  params: DepositLoanDetailsQuery,
  counterparties: Counterparty[]
): IExtendedDisclosedDepositLoan[] => {
  return populateDisclosedDepositsLoansWithCompanyName(
    filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration(disclosedItems, params),
    counterparties
  )
}

export const populateRequestsData = (
  requests: IDepositLoanRequestDocument[],
  counterparties: Counterparty[]
): IExtendRequestDepositLoan[] => {
  return requests.map(request => {
    const company = findCounterpartyByStatic(counterparties, request.companyStaticId)
    return {
      ...request,
      currencyAndTenor: getCurrencyWithTenor(request),
      currencyAndTenorStringValue: createCurrencyAndPeriodStringValue(request),
      companyName: getCompanyName(company)
    }
  })
}
