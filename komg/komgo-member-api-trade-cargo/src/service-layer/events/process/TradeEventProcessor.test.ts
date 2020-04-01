import 'reflect-metadata'

import logger from '@komgo/logging'
import { TradeEventProcessor } from './TradeEventProcessor'
import { ITradeDataAgent } from '../../../data-layer/data-agents/ITradeDataAgent'
import { Trade } from '../../../data-layer/models/Trade'
import { ITradeMessageData } from '../../../business-layer/data/request-messages/ITradeMessageData'
import { ICounterpartyClient } from '../../../data-layer/clients/ICounterpartyClient'
import { NotificationManager } from '@komgo/notification-publisher'

import { createMockInstance } from 'jest-create-mock-instance'
import { IEventMessagePublisher } from '../IEventMessagePublisher'
import {
  CreditRequirements,
  TradeSource,
  PaymentTermsWhen,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  Currency,
  PriceUnit,
  InvoiceQuantity
} from '@komgo/types'
import { ReceivableDiscountStatus } from '../../../data-layer/constants/ReceivableDiscountStatus'
import { LOC_STATUS } from '../../../data-layer/constants/LetterOfCreditStatus'

let processor

logger.info = jest.fn()
logger.warn = jest.fn()
logger.error = jest.fn()

const MOCK_BUYER_STATIC_ID = 'GUNVOR_BFOET-123'
const MOCK_SELLER_STATIC_ID = 'SHELL_BFOET-123'

let tradeDataAgentMock: jest.Mocked<ITradeDataAgent>
let counterpartyClient: jest.Mocked<ICounterpartyClient>
let notificationClientMock: jest.Mocked<NotificationManager>

let memberClientMock
let publisherMock: IEventMessagePublisher

const baseTrade: ITradeMessageData = {
  version: 1,
  messageType: 'KOMGO.Trade.TradeData',
  vaktId: 'E2389423',
  buyer: MOCK_BUYER_STATIC_ID,
  buyerEtrmId: 'G2389423',
  sellerEtrmId: 'sellerEtrm',
  seller: MOCK_SELLER_STATIC_ID,
  dealDate: '2017-12-31',
  deliveryPeriod: {
    startDate: '2017-12-31',
    endDate: '2017-12-31'
  },
  paymentTerms: {
    eventBase: 'BL',
    when: 'AFTER',
    time: 30,
    timeUnit: 'DAYS',
    dayType: 'CALENDAR'
  },
  price: 70.02,
  currency: 'USD',
  priceUnit: 'BBL',
  quantity: 600000,
  deliveryTerms: 'FOB',
  minTolerance: 1.25,
  maxTolerance: 1.25,
  invoiceQuantity: 'load',
  generalTermsAndConditions: 'suko90',
  law: 'English Law',
  requiredDocuments: ['Q88']
}

const buyerTradeData: ITradeMessageData = {
  ...baseTrade,
  creditRequirement: CreditRequirements.DocumentaryLetterOfCredit,
  laytime: 'as per GT&Cs',
  demurrageTerms: "as per GT&C's"
}

const sellerTradeData: ITradeMessageData = {
  ...baseTrade,
  creditRequirement: CreditRequirements.OpenCredit
}

const existingTradeDocument = [
  {
    _id: '5ba1f9dbecf7c7048d81bcc9',
    source: TradeSource.Vakt,
    sourceId: 'E2389423',
    status: 'TO_BE_FINANCED',
    buyer: MOCK_BUYER_STATIC_ID,
    buyerEtrmId: MOCK_BUYER_STATIC_ID,
    seller: MOCK_SELLER_STATIC_ID,
    dealDate: '2017-12-31',
    deliveryPeriod: {
      startDate: '2017-12-31',
      endDate: '2017-12-31'
    },
    paymentTerms: {
      eventBase: 'BL',
      when: 'AFTER',
      time: 30,
      timeUnit: 'DAYS',
      dayType: 'CALENDAR'
    },
    price: 70.02,
    currency: 'USD',
    priceUnit: 'BBL',
    quantity: 600000,
    deliveryTerms: 'FOB',
    minTolerance: 1.25,
    maxTolerance: 1.25,
    invoiceQuantity: 'load',
    generalTermsAndConditions: 'suko90',
    laytime: 'as per GT&Cs',
    demurrageTerms: "as per GT&C's",
    law: 'English Law',
    requiredDocuments: ['Q88'],
    __v: 0
  }
]

describe('Trade Event Processor', () => {
  beforeEach(() => {
    tradeDataAgentMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      count: null,
      delete: null,
      get: null
    }

    counterpartyClient = {
      autoAdd: jest.fn()
    }

    memberClientMock = {
      find: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_STATIC_ID }]))
        .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_SELLER_STATIC_ID }]))
    }

    publisherMock = {
      publishCargoUpdated: jest.fn(),
      publishTradeUpdated: jest.fn()
    }

    notificationClientMock = createMockInstance(NotificationManager)
  })

  describe('Buyer trade tests', () => {
    let tradeData
    beforeEach(() => {
      tradeData = { ...buyerTradeData }

      processor = new TradeEventProcessor(
        tradeDataAgentMock,
        notificationClientMock,
        memberClientMock,
        counterpartyClient,
        MOCK_BUYER_STATIC_ID,
        publisherMock
      )
    })

    it('saves new trade data', async () => {
      await processor.processEvent(tradeData, TradeSource.Vakt)

      tradeDataAgentMock.find.mockImplementation(() => null)

      expect(tradeDataAgentMock.find).toHaveBeenCalledWith({
        sourceId: tradeData.vaktId,
        source: TradeSource.Vakt
      })

      const { buyer, seller, version, messageType, ...props } = tradeData

      expect(tradeDataAgentMock.create).toHaveBeenCalled()
      expect(tradeDataAgentMock.create.mock.calls[0][0]).toEqual(
        new Trade(TradeSource.Vakt, tradeData.vaktId, MOCK_BUYER_STATIC_ID, {
          ...props,
          commodity: 'BFOET',
          buyer: MOCK_BUYER_STATIC_ID,
          seller: MOCK_SELLER_STATIC_ID
        })
      )

      expect(tradeDataAgentMock.create.mock.calls[0][0].status).toBe(LOC_STATUS.TO_BE_FINANCED)
      expect(notificationClientMock.createNotification).toHaveBeenCalled()
      const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
      expect(messageArg.context.vaktId).toBe(tradeData.vaktId)
      expect(messageArg.message).toContain('New')
      expect(counterpartyClient.autoAdd).toHaveBeenCalled()
    })

    it('defaults creditRequirement to DocumentaryLetterOfCredit if not present in vakt message', async () => {
      delete buyerTradeData.creditRequirement
      await processor.processEvent(buyerTradeData, TradeSource.Vakt)

      tradeDataAgentMock.find.mockImplementation(() => null)

      const {
        buyer,
        seller,
        version,
        messageType,
        vaktId,
        paymentTerms,
        currency,
        priceUnit,
        invoiceQuantity,
        creditRequirement,
        ...props
      } = buyerTradeData
      // const { vaktId, buyer, seller, version, messageType, , ...props } = data

      expect(tradeDataAgentMock.create).toHaveBeenCalled()
      expect(tradeDataAgentMock.create.mock.calls[0][0]).toEqual(
        new Trade(TradeSource.Vakt, buyerTradeData.vaktId, MOCK_BUYER_STATIC_ID, {
          ...props,
          paymentTerms: {
            eventBase: paymentTerms.eventBase,
            when: paymentTerms.when as PaymentTermsWhen,
            time: paymentTerms.time,
            timeUnit: paymentTerms.timeUnit as PaymentTermsTimeUnit,
            dayType: paymentTerms.dayType as PaymentTermsDayType
          },
          currency: currency as Currency,
          invoiceQuantity: invoiceQuantity as InvoiceQuantity,
          priceUnit: priceUnit as PriceUnit,
          commodity: 'BFOET',
          buyer: MOCK_BUYER_STATIC_ID,
          seller: MOCK_SELLER_STATIC_ID,
          creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
        })
      )
    })

    it('update trade data', async () => {
      tradeDataAgentMock.find.mockImplementation(() => [existingTradeDocument])

      await processor.processEvent(buyerTradeData, TradeSource.Vakt)

      expect(tradeDataAgentMock.find).toHaveBeenCalledWith({
        sourceId: buyerTradeData.vaktId,
        source: TradeSource.Vakt
      })

      expect(tradeDataAgentMock.update).toHaveBeenCalled()
      expect(tradeDataAgentMock.create).not.toHaveBeenCalled()

      expect(notificationClientMock.createNotification).toHaveBeenCalled()
      const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
      expect(messageArg.context.vaktId).toBe(buyerTradeData.vaktId)
      expect(messageArg.message).toContain('Updated')
    })

    it('fails if no counterparty data can be resolved', async () => {
      const newTradeData = { ...buyerTradeData, creditRequirement: CreditRequirements.StandbyLetterOfCredit }
      memberClientMock.find = jest.fn().mockReturnValue(Promise.resolve([]))
      const result = processor.processEvent(newTradeData, TradeSource.Vakt)

      await expect(result).rejects.toBeDefined()
    })
  })

  describe('Seller trade tests', () => {
    let tradeData

    beforeEach(() => {
      tradeData = { ...sellerTradeData }

      processor = new TradeEventProcessor(
        tradeDataAgentMock,
        notificationClientMock,
        memberClientMock,
        counterpartyClient,
        MOCK_SELLER_STATIC_ID,
        publisherMock
      )
    })

    it('saves new trade data and blanks out sellerEtrmId', async () => {
      await processor.processEvent(tradeData, TradeSource.Vakt)

      tradeDataAgentMock.find.mockImplementation(() => null)

      expect(tradeDataAgentMock.find).toHaveBeenCalledWith({
        sourceId: tradeData.vaktId,
        source: TradeSource.Vakt
      })

      const { buyer, seller, version, messageType, vaktId, ...props } = tradeData

      expect(tradeDataAgentMock.create).toHaveBeenCalled()
      expect(tradeDataAgentMock.create.mock.calls[0][0]).toEqual(
        new Trade(TradeSource.Vakt, tradeData.vaktId, MOCK_SELLER_STATIC_ID, {
          ...props,
          commodity: 'BFOET',
          buyer: MOCK_BUYER_STATIC_ID,
          seller: MOCK_SELLER_STATIC_ID,
          creditRequirement: CreditRequirements.OpenCredit
        })
      )

      expect(tradeDataAgentMock.create.mock.calls[0][0].status).toBe(ReceivableDiscountStatus.ToBeDiscounted)
      expect(notificationClientMock.createNotification).toHaveBeenCalled()
      const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
      expect(messageArg.context.vaktId).toBe(tradeData.vaktId)
      expect(messageArg.message).toContain('New')
      expect(counterpartyClient.autoAdd).toHaveBeenCalled()
    })

    it('update trade data', async () => {
      tradeDataAgentMock.find.mockImplementation(() => [existingTradeDocument])

      await processor.processEvent(tradeData, TradeSource.Vakt)

      expect(tradeDataAgentMock.find).toHaveBeenCalledWith({
        sourceId: tradeData.vaktId,
        source: TradeSource.Vakt
      })

      const { buyer, seller, version, messageType, ...props } = tradeData

      expect(tradeDataAgentMock.update.mock.calls[0][1]).toEqual(
        new Trade(TradeSource.Vakt, tradeData.vaktId, MOCK_SELLER_STATIC_ID, {
          ...props,
          commodity: 'BFOET',
          buyer: MOCK_BUYER_STATIC_ID,
          seller: MOCK_SELLER_STATIC_ID,
          creditRequirement: CreditRequirements.OpenCredit
        })
      )

      expect(tradeDataAgentMock.update).toHaveBeenCalled()
      expect(tradeDataAgentMock.create).not.toHaveBeenCalled()

      expect(notificationClientMock.createNotification).toHaveBeenCalled()
      const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
      expect(messageArg.context.vaktId).toBe(tradeData.vaktId)
      expect(messageArg.message).toContain('Updated')
    })
  })
})
