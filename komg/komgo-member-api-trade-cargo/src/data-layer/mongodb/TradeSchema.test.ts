import { model } from 'mongoose'
import 'reflect-metadata'

import TradeSchema from './TradeSchema'
import {
  PaymentTermsEventBase,
  PaymentTermsWhen,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  PriceUnit,
  DeliveryTerms,
  InvoiceQuantity,
  CreditRequirements,
  TradeSource
} from '@komgo/types'
import { LOC_STATUS } from '../constants/LetterOfCreditStatus'
import { ReceivableDiscountStatus } from '../constants/ReceivableDiscountStatus'

const MOCK_BUYER_STATIC_ID = 'GUNVOR_BFOET-123'
const MOCK_SELLER_STATIC_ID = 'SHELL_BFOET-123'

describe('tradeSchema', () => {
  function getTradeData(creditRequirement, status, laytime, demurrageTerms, buyer: boolean) {
    const tradeData: any = {
      source: TradeSource.Komgo,
      commodity: 'BFOET',
      sourceId: 'E2389423',
      buyer: MOCK_BUYER_STATIC_ID,
      seller: MOCK_SELLER_STATIC_ID,
      dealDate: '2017-12-31',
      deliveryPeriod: {
        startDate: '2017-12-31',
        endDate: '2017-12-31'
      },
      paymentTerms: {
        eventBase: PaymentTermsEventBase.BL,
        when: PaymentTermsWhen.After,
        time: 30,
        timeUnit: PaymentTermsTimeUnit.Days,
        dayType: PaymentTermsDayType.Calendar
      },
      price: 70.02,
      currency: 'USD',
      priceUnit: PriceUnit.BBL,
      quantity: 600000,
      deliveryTerms: DeliveryTerms.FOB,
      deliveryLocation: 'Stansted',
      minTolerance: 1.25,
      maxTolerance: 1.25,
      invoiceQuantity: InvoiceQuantity.Load,
      generalTermsAndConditions: 'suko90',
      laytime,
      demurrageTerms,
      law: 'English Law',
      requiredDocuments: ['Q88'],
      creditRequirement,
      status
    }
    buyer ? (tradeData.buyerEtrmId = 'buyerEtrm') : (tradeData.sellerEtrmId = 'sellerEtrm')
    return tradeData
  }

  describe('SALE trade validation tests', () => {
    beforeEach(() => {
      // Set the correct COMPANY_STATIC_ID for the trade test data
      process.env.COMPANY_STATIC_ID = MOCK_SELLER_STATIC_ID
    })

    it('should pass validation', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.OpenCredit,
        ReceivableDiscountStatus.ToBeDiscounted,
        undefined,
        undefined,
        false
      )
      const trade = getTrade(source, sourceId, data)
      await trade.validate()
      // won't throw error if succesful
    })

    it('should pass validation if buyerEtrmId and sellerEtrmId are populated when the source is VAKT', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.OpenCredit,
        ReceivableDiscountStatus.ToBeDiscounted,
        undefined,
        undefined,
        false
      )
      data.source = TradeSource.Vakt
      data.buyerEtrmId = 'buyerEt'

      const trade = getTrade(source, sourceId, data)

      await trade.validate()
      // won't throw error if successful
    })

    it('should pass validation if buyerEtrmId is an empty sring and source is KOMGO', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.OpenCredit,
        ReceivableDiscountStatus.ToBeDiscounted,
        undefined,
        undefined,
        false
      )
      data.buyerEtrmId = ''
      const trade = getTrade(source, sourceId, data)

      await trade.validate()
      // won't throw error if succesful
    })

    it('should pass validation if buyerEtrmId demurrageTerms and laytime are present and source is KOMGO', async () => {
      // expect.assertions(3)
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.OpenCredit,
        ReceivableDiscountStatus.ToBeDiscounted,
        'layVal',
        'demurrageVal',
        true
      )
      data.sellerEtrmId = 'sellerEtrmId'
      const trade = getTrade(source, sourceId, data)
      await trade.validate()
    })

    it('should fail validation if sellerEtrmId is not present and source is KOMGO', async () => {
      expect.assertions(1)
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.OpenCredit,
        ReceivableDiscountStatus.ToBeDiscounted,
        undefined,
        undefined,
        false
      )
      delete data.sellerEtrmId
      const trade = getTrade(source, sourceId, data)

      try {
        await trade.validate()
      } catch (e) {
        expect(e.errors.sellerEtrmId).toBeDefined()
      }
    })

    it('should fail validation if sellerEtrmId is an empty string and source is KOMGO', async () => {
      expect.assertions(1)
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.OpenCredit,
        ReceivableDiscountStatus.ToBeDiscounted,
        undefined,
        undefined,
        false
      )

      data.sellerEtrmId = ''
      const trade = getTrade(source, sourceId, data)

      try {
        await trade.validate()
      } catch (e) {
        expect(e.errors.sellerEtrmId).toBeDefined()
      }
    })
  })

  describe('PURCHASE trade validation tests', () => {
    beforeEach(() => {
      // Set the correct COMPANY_STATIC_ID for the trade test data
      process.env.COMPANY_STATIC_ID = MOCK_BUYER_STATIC_ID
    })

    it('should pass validation', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.DocumentaryLetterOfCredit,
        LOC_STATUS.TO_BE_FINANCED,
        'layVal',
        'demurrageVal',
        true
      )
      const trade = getTrade(source, sourceId, data)

      await trade.validate()
      // won't throw error if succesful
    })

    it('should pass validation with buyerEtrmId and sellerEtrmId when source is VAKT', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.DocumentaryLetterOfCredit,
        LOC_STATUS.TO_BE_FINANCED,
        'layVal',
        'demurrageVal',
        true
      )
      const trade = getTrade(source, sourceId, data)
      trade.source = TradeSource.Vakt
      trade.sellerEtrmId = 'seller'

      await trade.validate()
      // won't throw error if succesful
    })

    it('should pass validation with law empty', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.DocumentaryLetterOfCredit,
        LOC_STATUS.TO_BE_FINANCED,
        'layVal',
        'demurrageVal',
        true
      )
      data.law = ''
      const trade = getTrade(source, sourceId, data)

      await trade.validate()
      // won't throw error if succesful
    })

    it('should pass validation if sellerEtrmId is empty string and source is KOMGO', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.DocumentaryLetterOfCredit,
        LOC_STATUS.TO_BE_FINANCED,
        'layVal',
        'demurrageVal',
        true
      )
      data.sellerEtrmId = ''
      const trade = getTrade(source, sourceId, data)

      await trade.validate()
      // won't throw error if succesful
    })

    it('should pass validation if optionals(generalT&Cs, demurridge, laytime) are empty', async () => {
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.DocumentaryLetterOfCredit,
        LOC_STATUS.TO_BE_FINANCED,
        '',
        '',
        true
      )
      data.sellerEtrmId = ''
      data.generalTermsAndConditions = ''
      const trade = getTrade(source, sourceId, data)

      await trade.validate()
      // won't throw error if succesful
    })

    /// empty string tests
    it('should fail validation if buyerEtrmId is not present', async () => {
      expect.assertions(1)
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.StandbyLetterOfCredit,
        LOC_STATUS.AMENDMENT_ACCEPTED,
        'layVal',
        'demurrageVal',
        true
      )
      delete data.buyerEtrmId
      const trade = getTrade(source, sourceId, data)

      try {
        await trade.validate()
      } catch (e) {
        expect(e.errors.buyerEtrmId).toBeDefined()
      }
    })

    /// empty string tests
    it('should fail validation if buyerEtrmId is an empty string', async () => {
      expect.assertions(1)
      const { source, sourceId, ...data } = getTradeData(
        CreditRequirements.StandbyLetterOfCredit,
        LOC_STATUS.AMENDMENT_ACCEPTED,
        'layVal',
        'demurrageVal',
        true
      )
      data.buyerEtrmId = ''
      const trade = getTrade(source, sourceId, data)

      try {
        await trade.validate()
      } catch (e) {
        expect(e.errors.buyerEtrmId).toBeDefined()
      }
    })
  })

  function getTrade(source, sourceId, data) {
    const Trade = model('TradeSchema', TradeSchema)
    const trade = new Trade({
      source,
      sourceId,
      ...data
    })
    return trade
  }
  /// test empty strings
})
