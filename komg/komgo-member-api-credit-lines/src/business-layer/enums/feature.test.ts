import { DepositLoanType } from '@komgo/types'

import { getFeatureForProduct, FeatureType, getDepositLoanFeatureType } from './feature'
import { SubProduct, Product } from './products'

describe('getFeatureForProduct', () => {
  it('should return FeatureType.BankLine', () => {
    expect(getFeatureForProduct(Product.TradeFinance, SubProduct.LC)).toBe(FeatureType.BankLine)
  })

  it('should return FeatureType.RiskCover', () => {
    expect(getFeatureForProduct(Product.TradeFinance, SubProduct.RD)).toBe(FeatureType.RiskCover)
  })

  it('should return undefiend for TradeFinance and unsupported subproduct', () => {
    expect(getFeatureForProduct(Product.TradeFinance, 'some')).toBeUndefined()
  })

  it('should return undefiend for unsupported product', () => {
    expect(getFeatureForProduct('some', 'some')).toBeUndefined()
  })
})

describe('getDepositLoanFeatureType', () => {
  it('should return Deposit', () => {
    expect(getDepositLoanFeatureType(DepositLoanType.Deposit)).toBe(FeatureType.Deposit)
  })

  it('should return Loan', () => {
    expect(getDepositLoanFeatureType(DepositLoanType.Loan)).toBe(FeatureType.Loan)
  })

  it('should return undefined for unknow', () => {
    expect(getDepositLoanFeatureType(undefined)).toBe(undefined)
  })
})
