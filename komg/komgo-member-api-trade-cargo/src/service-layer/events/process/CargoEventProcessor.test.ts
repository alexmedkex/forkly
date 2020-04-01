import 'reflect-metadata'

import logger from '@komgo/logging'
import { IMessageConsumer, MessagingFactory, IMessageReceived } from '@komgo/messaging-library'

import { ICargoDataAgent } from '../../../data-layer/data-agents/ICargoDataAgent'
import { CargoEventProcessor } from './CargoEventProcessor'
import { ICargoData } from '../../../business-layer/data/request-messages/ICargoData'
import { cargoDataMapper } from '../../../business-layer/data/request-messages/mapper/cargoDataMapper'
import { NotificationManager } from '@komgo/notification-publisher'

import { createMockInstance } from 'jest-create-mock-instance'
import { ITradeDataAgent } from '../../../data-layer/data-agents/ITradeDataAgent'
import { ModeOfTransport, TradeSource, Grade, buildFakeCargo, buildFakeParcel } from '@komgo/types'
import { IEventMessagePublisher } from '../IEventMessagePublisher'

let processor

logger.info = jest.fn()
logger.warn = jest.fn()
logger.error = jest.fn()

let cargoDataAgentMock: jest.Mocked<ICargoDataAgent>
let tradeDataAgentMock: jest.Mocked<ITradeDataAgent>
let notificationClientMock: jest.Mocked<NotificationManager>
let publisherMock: IEventMessagePublisher
const cargoDataMessage: ICargoData = {
  cargoId: 'F0401',
  vaktId: 'E2389423',
  grade: 'A1',
  messageType: 'KOMGO.Trade.CargoData',
  version: 1,
  parcels: [
    {
      deemedBLDate: '2017-12-31',
      modeOfTransport: ModeOfTransport.Pipeline,
      dischargeArea: 'FAWLEY',
      id: 'F0401/A',
      inspector: 'INTERTEK',
      laycanPeriod: { startDate: '2017-12-31', endDate: '2017-12-31' },
      loadingPort: 'SULLOM_VOE',
      quantity: 600000,
      vesselIMO: 9747974,
      vesselName: 'TERN SEA'
    }
  ]
}

const MOCK_BUYER_VAKT_STATIC_ID = 'GUNVOR_BFOET-123'
const MOCK_SELLER_VAKT_STATIC_ID = 'SHELL_BFOET-123'
const TRADE_ID = 'E2389423'

const existingTradeDocument = {
  _id: '5ba1f9dbecf7c7048d81bcc9',
  source: TradeSource.Vakt,
  sourceId: TRADE_ID,
  status: 'TO_BE_FINANCED',
  buyer: MOCK_BUYER_VAKT_STATIC_ID,
  buyerEtrmId: MOCK_BUYER_VAKT_STATIC_ID,
  seller: MOCK_SELLER_VAKT_STATIC_ID,
  sellerEtrmId: MOCK_SELLER_VAKT_STATIC_ID,
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

const existingCargoDocument = {
  cargoId: 'F0401',
  createdAt: undefined,
  sourceId: TRADE_ID,
  grade: 'A1',
  __v: 0,
  _id: '5ba74a5fd0d160031fc71696',
  source: TradeSource.Vakt,
  status: 'TO_BE_FINANCED',
  updatedAt: undefined,
  parcels: [
    {
      deemedBLDate: undefined,
      modeOfTransport: ModeOfTransport.Pipeline,
      dischargeArea: 'FAWLEY',
      id: 'F0401/A',
      inspector: 'INTERTEK',
      laycanPeriod: { startDate: new Date(), endDate: new Date() },
      loadingPort: 'SULLOM_VOE',
      quantity: 600000,
      vesselIMO: 9747974,
      vesselName: 'TERN SEA'
    }
  ]
}

describe('Cargo Event Processor', () => {
  beforeEach(() => {
    cargoDataAgentMock = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: null,
      find: null,
      findOne: jest.fn(),
      count: null
    }

    tradeDataAgentMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      count: null,
      delete: null,
      get: null
    }
    publisherMock = {
      publishCargoUpdated: jest.fn(),
      publishTradeUpdated: jest.fn()
    }

    notificationClientMock = createMockInstance(NotificationManager)
    processor = new CargoEventProcessor(
      cargoDataAgentMock,
      tradeDataAgentMock,
      notificationClientMock,
      'company-static-id-1',
      publisherMock
    )
  })

  it('saves new cargo movement data', async () => {
    tradeDataAgentMock.findOne.mockImplementation(() => existingTradeDocument)
    await processor.processEvent(cargoDataMessage, TradeSource.Vakt)

    cargoDataAgentMock.findOne.mockImplementation(() => null)
    expect(cargoDataAgentMock.findOne).toHaveBeenCalledWith(
      {
        sourceId: cargoDataMessage.vaktId,
        cargoId: cargoDataMessage.cargoId
      },
      TradeSource.Vakt
    )
    expect(tradeDataAgentMock.findOne).toHaveBeenCalledWith(
      {
        sourceId: cargoDataMessage.vaktId
      },
      TradeSource.Vakt
    )
    expect(cargoDataAgentMock.create).toHaveBeenCalled()
    const cargoData = cargoDataMapper(cargoDataMessage, TradeSource.Vakt)
    expect(cargoDataAgentMock.create.mock.calls[0][0]).toEqual(cargoData)

    expect(notificationClientMock.createNotification).toHaveBeenCalled()
    const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
    expect(messageArg.context.vaktId).toBe(cargoDataMessage.vaktId)
    expect(messageArg.message).toContain('New')
  })

  it('saves new cargo movement data tradeEtmId same as buyerEtrmId ', async () => {
    const existingTradeDocumentWithBuyerAsCompanyStaticId = {
      ...existingTradeDocument,
      buyer: 'company-static-id-1'
    }
    tradeDataAgentMock.findOne.mockImplementation(() => existingTradeDocumentWithBuyerAsCompanyStaticId)
    await processor.processEvent(cargoDataMessage, TradeSource.Vakt)

    cargoDataAgentMock.findOne.mockImplementation(() => null)
    expect(cargoDataAgentMock.findOne).toHaveBeenCalledWith(
      {
        sourceId: cargoDataMessage.vaktId,
        cargoId: cargoDataMessage.cargoId
      },
      TradeSource.Vakt
    )

    expect(cargoDataAgentMock.create).toHaveBeenCalled()
    const cargoData = cargoDataMapper(cargoDataMessage, TradeSource.Vakt)
    expect(cargoDataAgentMock.create.mock.calls[0][0]).toEqual(cargoData)

    expect(notificationClientMock.createNotification).toHaveBeenCalled()
    const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
    expect(messageArg.context.vaktId).toBe(cargoDataMessage.vaktId)
    expect(messageArg.message).toContain('New')
  })

  it('update trade data', async () => {
    cargoDataAgentMock.findOne.mockImplementation(() => [existingCargoDocument])
    tradeDataAgentMock.findOne.mockImplementation(() => existingTradeDocument)

    await processor.processEvent(cargoDataMessage, TradeSource.Vakt)

    expect(cargoDataAgentMock.findOne).toHaveBeenCalledWith(
      {
        sourceId: cargoDataMessage.vaktId,
        cargoId: cargoDataMessage.cargoId
      },
      TradeSource.Vakt
    )

    expect(cargoDataAgentMock.update).toHaveBeenCalled()
    expect(cargoDataAgentMock.create).not.toHaveBeenCalled()

    expect(notificationClientMock.createNotification).toHaveBeenCalled()
    const messageArg = notificationClientMock.createNotification.mock.calls[0][0]
    expect(messageArg.context.vaktId).toBe(cargoDataMessage.vaktId)
    expect(messageArg.message).toContain('Updated')
  })
})
