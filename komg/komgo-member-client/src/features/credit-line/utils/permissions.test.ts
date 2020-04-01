import { getCrudPermission, getReadPermission } from './permissions'
import { CreditLineType } from '../store/types'
import { tradeFinanceManager } from '@komgo/permissions'

describe('get permission', () => {
  it('should return crud permission for bank lines', () => {
    expect(getCrudPermission(CreditLineType.BankLine)).toEqual(tradeFinanceManager.canCrudBankLine)
  })
  it('should return crud permission for risk cover', () => {
    expect(getCrudPermission(CreditLineType.RiskCover)).toEqual(tradeFinanceManager.canCrudRiskCover)
  })
  it('should return read permission for bank lines', () => {
    expect(getReadPermission(CreditLineType.BankLine)).toEqual(tradeFinanceManager.canReadBankLine)
  })
  it('should return crud permission for risk cover', () => {
    expect(getReadPermission(CreditLineType.RiskCover)).toEqual(tradeFinanceManager.canReadRiskCover)
  })
})
