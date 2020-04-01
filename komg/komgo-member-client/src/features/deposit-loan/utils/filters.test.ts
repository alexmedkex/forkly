import { buildFakeDepositLoanResponse, buildFakeDepositLoan, buildFakeShareDepositLoan } from '@komgo/types'

import { filterOutAlredayExistsCurrencyAndTenor, removeUnnecessaryData } from './filters'
import { createDefaultCurrencyAndPeriodDropdownOptions } from './factories'
import { defaultShared } from '../constants'

describe('filterOutAlredayExistsCurrencyAndTenor', () => {
  const defaultOptions = createDefaultCurrencyAndPeriodDropdownOptions()

  it('should return all (35) options', () => {
    expect(filterOutAlredayExistsCurrencyAndTenor(defaultOptions, []).length).toBe(35)
  })

  it('should return skip one option and return 34', () => {
    expect(filterOutAlredayExistsCurrencyAndTenor(defaultOptions, [buildFakeDepositLoanResponse()]).length).toBe(34)
  })
})

describe('removeUnnecessaryData', () => {
  const deposit1 = { ...buildFakeDepositLoan(), sharedWith: [buildFakeShareDepositLoan()] }

  it('should return filterad data when function should not filter out anything', () => {
    expect(removeUnnecessaryData(deposit1)).toEqual(deposit1)
  })

  it('should return filterad data', () => {
    const extendedDeposit1 = {
      ...deposit1,
      currencyAndTenor: 'test',
      sharedWith: [...deposit1.sharedWith, defaultShared]
    }
    expect(removeUnnecessaryData(extendedDeposit1)).toEqual(deposit1)
  })
})
