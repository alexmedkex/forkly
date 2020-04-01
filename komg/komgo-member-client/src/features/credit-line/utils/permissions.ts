import { tradeFinanceManager } from '@komgo/permissions'
import { CreditLineType } from '../store/types'
import { CreditAppetiteDepositLoanFeature } from '../../deposit-loan/store/types'

export const getReadPermission = (feature: CreditLineType | CreditAppetiteDepositLoanFeature) => {
  switch (feature) {
    case CreditLineType.BankLine:
      return tradeFinanceManager.canReadBankLine
    case CreditLineType.RiskCover:
      return tradeFinanceManager.canReadRiskCover
    case CreditAppetiteDepositLoanFeature.Deposit:
      return tradeFinanceManager.canReadDeposit
    case CreditAppetiteDepositLoanFeature.Loan:
      return tradeFinanceManager.canReadLoan
    default:
      return null
  }
}

export const getCrudPermission = (feature: CreditLineType | CreditAppetiteDepositLoanFeature) => {
  switch (feature) {
    case CreditLineType.BankLine:
      return tradeFinanceManager.canCrudBankLine
    case CreditLineType.RiskCover:
      return tradeFinanceManager.canCrudRiskCover
    case CreditAppetiteDepositLoanFeature.Deposit:
      return tradeFinanceManager.canCrudDeposit
    case CreditAppetiteDepositLoanFeature.Loan:
      return tradeFinanceManager.canCrudLoan
    default:
      return null
  }
}
