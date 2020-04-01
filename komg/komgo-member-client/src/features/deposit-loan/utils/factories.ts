import { DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'
import {
  CreditAppetiteDepositLoanFeature,
  IDepositLoanForm,
  IRequestDepositLoanInformationForm,
  DepositLoanDetailsQuery
} from '../store/types'
import { defaultShared } from '../constants'
import { getCurrencyWithTenor } from './selectors'
import { IRequestInformationForm } from '../../credit-line/store/types'

export const createInitialDepositLoan = (feature: CreditAppetiteDepositLoanFeature): Partial<IDepositLoanForm> => ({
  type: feature === CreditAppetiteDepositLoanFeature.Deposit ? DepositLoanType.Deposit : DepositLoanType.Loan,
  appetite: true,
  pricing: null,
  sharedWith: [defaultShared]
})

export const createDefaultCurrencyAndPeriodDropdownOptions = () => {
  // We are not going to use all currencies so we need confing array
  const currencies = [Currency.USD, Currency.EUR, Currency.GBP, Currency.CHF, Currency.JPY]
  const periods = [DepositLoanPeriod.Overnight, DepositLoanPeriod.Weeks, DepositLoanPeriod.Months]
  const periodsDuration = [1, 2, 3, 6, 12]

  const options = []

  currencies.forEach(currency =>
    periods.forEach(period => {
      if (period === DepositLoanPeriod.Overnight) {
        options.push({
          value: `${currency}/${period}`,
          content: getCurrencyWithTenor({ currency, period }),
          text: getCurrencyWithTenor({ currency, period })
        })
      } else if (period === DepositLoanPeriod.Weeks) {
        options.push({
          value: `${currency}/${period}/1`,
          content: getCurrencyWithTenor({ currency, period, periodDuration: 1 }),
          text: getCurrencyWithTenor({ currency, period, periodDuration: 1 })
        })
      } else {
        periodsDuration.forEach(periodDuration => {
          options.push({
            value: `${currency}/${period}/${periodDuration}`,
            content: getCurrencyWithTenor({ currency, period, periodDuration }),
            text: getCurrencyWithTenor({ currency, period, periodDuration })
          })
        })
      }
    })
  )

  return options
}

export const createInititialRequestInformation = (
  feature: CreditAppetiteDepositLoanFeature
): IRequestDepositLoanInformationForm => {
  return {
    type: feature === CreditAppetiteDepositLoanFeature.Deposit ? DepositLoanType.Deposit : DepositLoanType.Loan,
    mailTo: false,
    comment: '',
    requestForId: '',
    companyIds: []
  }
}
