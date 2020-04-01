import { Currency, DepositLoanPeriod, DepositLoanType } from '@komgo/types'

import {
  createCurrencyAndPeriodStringValue,
  createCurrencyAndPeriodObjFromString,
  formatRequestInfoData
} from './formatters'
import { IRequestDepositLoanInformationForm, CreditAppetiteDepositLoanFeature } from '../store/types'

describe('createCurrencyAndPeriodStringValue', () => {
  it('should return apropriate string when all items exists', () => {
    expect(
      createCurrencyAndPeriodStringValue({
        currency: Currency.EUR,
        period: DepositLoanPeriod.Months,
        periodDuration: 3
      })
    ).toBe('EUR/MONTHS/3')
  })

  it('should return apropriate string when periodDuration is undefined', () => {
    expect(createCurrencyAndPeriodStringValue({ currency: Currency.EUR, period: DepositLoanPeriod.Months })).toBe(
      'EUR/MONTHS'
    )
  })
})

describe('createCurrencyAndPeriodObjFromString', () => {
  it('should return currency and period', () => {
    expect(createCurrencyAndPeriodObjFromString('EUR/OVERNIGHT')).toEqual({
      currency: Currency.EUR,
      period: DepositLoanPeriod.Overnight
    })
  })

  it('should return currency, period and periodDuration', () => {
    expect(createCurrencyAndPeriodObjFromString('EUR/MONTHS/3')).toEqual({
      currency: Currency.EUR,
      period: DepositLoanPeriod.Months,
      periodDuration: 3
    })
  })
})

describe('formatRequestInfoData', () => {
  const requestFakeData: IRequestDepositLoanInformationForm = {
    type: DepositLoanType.Loan,
    mailTo: false,
    comment: 'This is a comment',
    requestForId: 'EUR/OVERNIGHT',
    companyIds: ['123']
  }

  const expectedFakeData = {
    type: DepositLoanType.Loan,
    comment: 'This is a comment',
    currency: Currency.EUR,
    period: DepositLoanPeriod.Overnight,
    companyIds: ['123']
  }

  it('should format form data and return object with data withoud mailToInfo', () => {
    expect(formatRequestInfoData(requestFakeData, CreditAppetiteDepositLoanFeature.Loan)).toEqual({
      data: expectedFakeData,
      mailToInfo: undefined
    })
  })

  it('should format form data and return object with data and mailToInfo', () => {
    const expectedMail = {
      subject: 'Appetite on EUR overnight in the context of Loan',
      body: 'This is a comment',
      email: ''
    }
    expect(formatRequestInfoData({ ...requestFakeData, mailTo: true }, CreditAppetiteDepositLoanFeature.Loan)).toEqual({
      data: expectedFakeData,
      mailToInfo: expectedMail
    })
  })
})
