import { Currency, DepositLoanPeriod } from '@komgo/types'
import { Allow } from 'class-validator'

export class DepositLoanFilter {
  @Allow()
  currency?: Currency
  @Allow()
  period?: DepositLoanPeriod
  @Allow()
  periodDuration?: number
}
