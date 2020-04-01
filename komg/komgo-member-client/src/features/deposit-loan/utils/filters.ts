import { IDepositLoanResponse } from '@komgo/types'

import { ICurrencyAndTenorOption, IDepositLoanForm } from '../store/types'
import { getCurrencyWithTenor } from './selectors'

export const filterOutAlredayExistsCurrencyAndTenor = (
  options: ICurrencyAndTenorOption[],
  depositsLoans: IDepositLoanResponse[]
) => {
  const depositsLoansSigniture = depositsLoans.map(depositLoan => getCurrencyWithTenor(depositLoan))
  return options.filter(option => !depositsLoansSigniture.includes(option.text))
}

export const removeUnnecessaryData = (values: IDepositLoanForm): IDepositLoanForm => {
  const newValues = { ...values }
  delete newValues.currencyAndTenor
  if (newValues.periodDuration === null) {
    delete newValues.periodDuration
  }

  newValues.sharedWith = newValues.sharedWith.filter(v => v.sharedWithStaticId)
  return newValues
}
