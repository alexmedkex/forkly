import { DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'

import {
  createDefaultCurrencyAndPeriodDropdownOptions,
  createInitialDepositLoan,
  createInititialRequestInformation
} from './factories'
import { defaultShared } from '../constants'
import { CreditAppetiteDepositLoanFeature } from '../store/types'

describe('createDefaultCurrencyAndPeriodDropdownOptions', () => {
  it('should have 30 items per default', () => {
    expect(createDefaultCurrencyAndPeriodDropdownOptions().length).toBe(35)
  })

  it('should set first one to USD overnight', () => {
    expect(createDefaultCurrencyAndPeriodDropdownOptions()[0]).toEqual({
      content: 'USD overnight',
      text: 'USD overnight',
      value: 'USD/OVERNIGHT'
    })
  })

  it('should set second one to USD 1 weeks', () => {
    expect(createDefaultCurrencyAndPeriodDropdownOptions()[1]).toEqual({
      content: 'USD 1 week',
      text: 'USD 1 week',
      value: 'USD/WEEKS/1'
    })
  })
})

describe('createInitialDepositLoan', () => {
  const defaultValue = {
    type: DepositLoanType.Deposit,
    appetite: true,
    pricing: null,
    sharedWith: [defaultShared]
  }

  it('should return appropriate default value fro deposit', () => {
    expect(createInitialDepositLoan(CreditAppetiteDepositLoanFeature.Deposit)).toEqual(defaultValue)
  })

  it('should return appropriate default value fro loan', () => {
    expect(createInitialDepositLoan(CreditAppetiteDepositLoanFeature.Loan)).toEqual({
      ...defaultValue,
      type: DepositLoanType.Loan
    })
  })
})

describe('createInititialRequestInformation', () => {
  it('should return default values for deposit', () => {
    expect(createInititialRequestInformation(CreditAppetiteDepositLoanFeature.Deposit)).toEqual({
      type: DepositLoanType.Deposit,
      mailTo: false,
      comment: '',
      requestForId: '',
      companyIds: []
    })
  })
})
