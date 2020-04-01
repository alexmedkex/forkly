import { DepositLoanType, DepositLoanRequestType } from '@komgo/types'

export enum DepositLoanTypeFeature {
  Deposit = 'deposit',
  Loan = 'loan'
}

export enum DepositLoanRequestTypeFeature {
  Requested = 'requested',
  Received = 'received'
}

export const getDepositLoanType = (type: DepositLoanTypeFeature): DepositLoanType => {
  switch (type) {
    case DepositLoanTypeFeature.Deposit:
      return DepositLoanType.Deposit
    case DepositLoanTypeFeature.Loan:
      return DepositLoanType.Loan
  }
}

export const getDepositLoanRequestType = (type: DepositLoanRequestTypeFeature): DepositLoanRequestType => {
  switch (type) {
    case DepositLoanRequestTypeFeature.Received:
      return DepositLoanRequestType.Received
    case DepositLoanRequestTypeFeature.Requested:
      return DepositLoanRequestType.Requested
  }
}
