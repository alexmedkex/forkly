import { createInitialRequestInforamtion, createInitialCreditLine } from './factories'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { Currency } from '@komgo/types'
import { defaultShared } from '../constants'

describe('createInitialCreditLine', () => {
  const defaultValue = {
    counterpartyStaticId: '',
    context: {
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting
    },
    appetite: true,
    availability: true,
    creditLimit: null,
    availabilityAmount: null,
    creditExpiryDate: '',
    data: {
      fee: null,
      maximumTenor: null,
      availabilityReserved: null
    },
    currency: Currency.USD,
    sharedCreditLines: [defaultShared]
  }

  it('should return appropraite init value for sub product rd', () => {
    expect(createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)).toEqual(defaultValue)
  })

  it('should return appropraite init value for sub product rd and counterpartyId passed from outside', () => {
    expect(createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting, '123')).toEqual({
      ...defaultValue,
      counterpartyStaticId: '123'
    })
  })

  it('should return appropraite init value for sub product lc', () => {
    expect(createInitialCreditLine(Products.TradeFinance, SubProducts.LetterOfCredit)).toEqual({
      ...defaultValue,
      context: {
        productId: Products.TradeFinance,
        subProductId: SubProducts.LetterOfCredit
      }
    })
  })
})

describe('createInitialRequestInforamtion', () => {
  const defaultValue = {
    context: {
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting
    },
    comment: '',
    requestForId: '',
    companyIds: [],
    mailTo: false
  }

  it('should return appropraite init value for sub product rd', () => {
    expect(createInitialRequestInforamtion(Products.TradeFinance, SubProducts.ReceivableDiscounting)).toEqual(
      defaultValue
    )
  })

  it('should return appropraite init value for sub product lc', () => {
    expect(createInitialRequestInforamtion(Products.TradeFinance, SubProducts.LetterOfCredit)).toEqual({
      ...defaultValue,
      context: {
        productId: Products.TradeFinance,
        subProductId: SubProducts.LetterOfCredit
      }
    })
  })
})
