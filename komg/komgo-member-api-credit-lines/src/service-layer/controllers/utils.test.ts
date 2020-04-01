import { DepositLoanType } from '@komgo/types'

import { getDepositLoanType, DepositLoanTypeFeature } from './utils'

describe('Utils', () => {
  describe('.getDepositLoanType', () => {
    it('converts deposit loan', async () => {
      expect(getDepositLoanType(DepositLoanTypeFeature.Deposit)).toEqual(DepositLoanType.Deposit)
      expect(getDepositLoanType(DepositLoanTypeFeature.Loan)).toEqual(DepositLoanType.Loan)
    })
  })
})
