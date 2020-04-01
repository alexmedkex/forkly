import { DepositLoanType } from '@komgo/types'

import { SubProduct, Product } from './products'

export enum FeatureType {
  RiskCover = 'RISK_COVER',
  BankLine = 'BANK_LINE',
  Deposit = 'DEPOSIT',
  Loan = 'LOAN'
}

export const getFeatureForProduct = (product: string, subProduct: string): FeatureType => {
  if (product === Product.TradeFinance) {
    switch (subProduct) {
      case SubProduct.LC:
        return FeatureType.BankLine
      case SubProduct.RD:
        return FeatureType.RiskCover
      default:
        return undefined
    }
  }
  return undefined
}

export const getDepositLoanFeatureType = (type: DepositLoanType): FeatureType => {
  switch (type) {
    case DepositLoanType.Deposit:
      return FeatureType.Deposit
    case DepositLoanType.Loan:
      return FeatureType.Loan
    default:
      return undefined
  }
}
