import {
  buildFakeDepositLoan,
  DepositLoanPeriod,
  buildFakeShareDepositLoan,
  buildFakeDepositLoanResponse,
  buildFakeDisclosedDepositLoanSummary,
  Currency,
  buildFakeDisclosedDepositLoan
} from '@komgo/types'

import {
  getCurrencyWithTenor,
  populateDepoistLoanWithSharedCompanyName,
  populateDepositLoansWithCurrencyAndTenorInfo,
  populateDisclosedDepositLoanSummariesWithCurrencyAndTenorInfo,
  filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration,
  populateDisclosedDepositsLoansWithCompanyName,
  filterAndExtendDisclosedDepositLoan
} from './selectors'
import { fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'

describe('getCurrencyWithTenor', () => {
  it('should return appropritate currency and tenor', () => {
    expect(getCurrencyWithTenor(buildFakeDepositLoan())).toBe('USD 3 months')
  })

  it('should return appropritate currency and tenor', () => {
    expect(
      getCurrencyWithTenor(buildFakeDepositLoan({ period: DepositLoanPeriod.Overnight, periodDuration: null }))
    ).toBe('USD overnight')
  })
})

describe('populateDepoistLoanWithSharedCompanyName', () => {
  const fakeCounterparties = [fakeCounterparty({ staticId: '123', commonName: 'Name 1' })]
  const fakeDeposit = {
    ...buildFakeDepositLoan(),
    sharedWith: [buildFakeShareDepositLoan({ sharedWithStaticId: '123' })]
  }

  it('should return appropritate currency and tenor', () => {
    expect(
      populateDepoistLoanWithSharedCompanyName(fakeDeposit, fakeCounterparties).sharedWith[0].sharedWithCompanyName
    ).toBe('Name 1')
  })
})

describe('populateDepositLoansWithCurrencyAndTenorInfo', () => {
  const fakeDeposit = buildFakeDepositLoanResponse()

  expect(populateDepositLoansWithCurrencyAndTenorInfo([fakeDeposit])).toEqual([
    { ...fakeDeposit, currencyAndTenor: 'USD 3 months' }
  ])
})

describe('populateDisclosedDepositLoanSummariesWithCurrencyAndTenorInfo', () => {
  const fakeSummary = buildFakeDisclosedDepositLoanSummary()

  expect(populateDisclosedDepositLoanSummariesWithCurrencyAndTenorInfo([fakeSummary])).toEqual([
    {
      ...fakeSummary,
      currencyAndTenor: 'USD 3 months'
    }
  ])
})

describe('filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration', () => {
  const params = { currency: Currency.EUR, period: DepositLoanPeriod.Months, periodDuration: 3 }
  const deposit1 = buildFakeDisclosedDepositLoan({ currency: Currency.EUR })
  const deposit2 = buildFakeDisclosedDepositLoan({ currency: Currency.USD })

  it('should filter array of items and return just one item which has the same params as params object', () => {
    expect(filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration([deposit1, deposit2], params).length).toBe(
      1
    )
  })

  it('should filter array of items and return empty array', () => {
    expect(
      filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration([deposit1, deposit2], {
        ...params,
        currency: Currency.JPY
      }).length
    ).toBe(0)
  })
})

describe('populateDisclosedDepositLoanWithCompanyName', () => {
  const counterparty = fakeCounterparty({ staticId: '123', commonName: 'SC' })
  const deposit1 = buildFakeDisclosedDepositLoan({ ownerStaticId: '123' })

  it('should populate deposit with company name and location', () => {
    expect(populateDisclosedDepositsLoansWithCompanyName([deposit1], [counterparty])).toEqual([
      {
        ...deposit1,
        companyName: 'SC',
        companyLocation: 'city'
      }
    ])
  })

  it('should populate deposit with - when counterparty does not match', () => {
    expect(
      populateDisclosedDepositsLoansWithCompanyName([{ ...deposit1, ownerStaticId: '1234' }], [counterparty])
    ).toEqual([
      {
        ...deposit1,
        companyName: '-',
        companyLocation: '-',
        ownerStaticId: '1234'
      }
    ])
  })
})

describe('filterAndExtendDisclosedDepositLoan', () => {
  const params = { currency: Currency.EUR, period: DepositLoanPeriod.Months, periodDuration: 3 }
  const counterparty = fakeCounterparty({ staticId: '123', commonName: 'SC' })
  const deposit1 = buildFakeDisclosedDepositLoan({ ownerStaticId: '123', currency: Currency.EUR })
  const deposit2 = buildFakeDisclosedDepositLoan({ currency: Currency.USD })

  it('should return one extended item that match given params', () => {
    expect(filterAndExtendDisclosedDepositLoan([deposit1, deposit2], params, [counterparty]).length).toBe(1)
  })
})
