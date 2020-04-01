import {
  DepositLoanType,
  DepositLoanPeriod,
  Currency,
  DepositLoanRequestType,
  DepositLoanRequestStatus
} from '@komgo/types'

export interface ICurrencyAndPeriod {
  type: DepositLoanType
  currency: Currency
  period: DepositLoanPeriod
  periodDuration?: number
}

export interface IDepositLoanRequestDocument {
  staticId: string

  // TODO Create same one
  requestType: DepositLoanRequestType

  type: DepositLoanType
  currency: Currency
  period: DepositLoanPeriod
  periodDuration?: number
  comment: string
  companyStaticId: string

  // TODO Create same one
  status: DepositLoanRequestStatus

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
