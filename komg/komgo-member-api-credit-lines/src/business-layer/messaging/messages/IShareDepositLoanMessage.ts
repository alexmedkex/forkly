import { DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'

import { ICreditLineMessage } from './ICreditLineMessage'

export interface ISharedDepositLoanMessage extends ICreditLineMessage<IShareDepositLoanPayload> {}

export interface IShareDepositLoanPayload {
  type: DepositLoanType
  currency: Currency
  period: DepositLoanPeriod
  periodDuration: number
  data?: ISharedDepositLoanData
}

export interface ISharedDepositLoanData {
  appetite: boolean
  pricing?: number
}
