import 'reflect-metadata'

import { createMockInstance } from 'jest-create-mock-instance'

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import IService from './IService'
import { EventService } from './EventService'
import { IMessageConsumer, MessagingFactory } from '@komgo/messaging-library'
import { ICommonEventProcessor } from './process/IEventProccessor'
import { MESSAGE_TYPE } from '../../business-layer/data/request-messages/MessageType'
import { ITradeMessageData } from '../../business-layer/data/request-messages/ITradeMessageData'
import IPollingServiceFactory from '../IPollingServiceFactory'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { buildFakeTrade } from '@komgo/types'

const createPollingMock = jest.fn<IService>().mockImplementation(() => asyncService)

const asyncService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

const mockPollingFactory: IPollingServiceFactory = {
  createPolling: createPollingMock
}

const getMock = jest.fn()

let mockMessagingFactory: jest.Mocked<MessagingFactory>
let mockEventTypeProcessor: ICommonEventProcessor

const mockMessageConsumer: IMessageConsumer = {
  cancel: jest.fn(),
  close: jest.fn(),
  listen: jest.fn(),
  listenMultiple: jest.fn(),
  get: getMock,
  ackAll: jest.fn(),
  isConnected: jest.fn()
}

const getMessage = messageData => {
  return {
    ack: jest.fn(),
    content: messageData,
    options: {
      messageId: '',
      recipientDomainID: '',
      senderDomainID: ''
    },
    routingKey: ''
  }
}

const PUBLISHER_ID = 'micro-service-to'
const CONSUMER_ID = 'micro-service'

const tradeMsg: ITradeMessageData = {
  version: 1,
  messageType: 'KOMGO.Trade.TradeData',
  vaktId: 'E2389423',
  buyer: 'GUNVOR_BFOET',
  buyerEtrmId: 'GUNVOR_BFOET',
  // buyer: {
  //   id: 'GUNVOR_BFOET',
  //   publicKey: 'd55ae7c247804428ca98ed524764d7b3f8f009c4147faac06b97033ecc1b986b'
  // },
  // seller: {
  //   id: 'SHELL_BFOET',
  //   publicKey: 'ff4a6ce19fbe31664eabbcece45c8e28d37ecaf889286ce579a53c5f684b437a'
  // },
  seller: 'SHELL_BFOET',
  sellerEtrmId: 'SHELL_BFOET',
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
  requiredDocuments: ['Q88']
}

describe('Trade Event Service', () => {
  let service: IService

  beforeEach(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)
    mockMessagingFactory.createConsumer.mockImplementation(() => {
      return mockMessageConsumer
    })
    mockEventTypeProcessor = {
      processEvent: jest.fn()
    }
    service = new EventService(
      mockMessagingFactory,
      mockEventTypeProcessor,
      mockEventTypeProcessor,
      CONSUMER_ID,
      PUBLISHER_ID,
      mockPollingFactory,
      1000
    )
  })

  it('activate consumer for Trade and Cargo', async () => {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()
    await asyncFunction(endFunction)

    expect(mockMessageConsumer.get).toHaveBeenCalledTimes(1)
    const calledWith = [getMock.mock.calls[0][1]]
    expect(JSON.stringify(calledWith)).toEqual('[["KOMGO.Trade.TradeData","KOMGO.Trade.CargoData"]]')
  })

  it('close the consumer on service stop', async () => {
    await service.stop()
    expect(mockMessageConsumer.close).toHaveBeenCalledTimes(1)
  })

  it('process message', async () => {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()
    getMock.mockImplementation(() => messageReceived)
    const messageData: any = { ...tradeMsg }
    messageData.messageType = MESSAGE_TYPE.KOMGO_Trade_TradeData
    const messageReceived = getMessage(messageData)

    await asyncFunction(endFunction)
    expect(mockEventTypeProcessor.processEvent).toHaveBeenCalledTimes(1)
    expect(loggerMock.error).toHaveBeenCalledTimes(0)
    expect(messageReceived.ack).toHaveBeenCalledTimes(1)
  })

  describe('log an error', () => {
    it("when a trade message doesn't contain the vaktId field", async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()
      getMock.mockImplementation(() => messageReceived)
      const messageData = { ...tradeMsg }
      delete messageData.vaktId
      const messageReceived = getMessage(messageData)

      await asyncFunction(endFunction)

      expect(loggerMock.error).toHaveBeenCalledTimes(1)
      expect(loggerMock.error).toHaveBeenCalledWith(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.MessageProcessingFailed,
        `Found MQ message without required [vaktId] field`
      )
      expect(mockEventTypeProcessor.processEvent).toHaveBeenCalledTimes(0)
      expect(messageReceived.ack).toHaveBeenCalledTimes(1)
    })

    it('when a message has unknown type', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()
      getMock.mockImplementation(() => messageReceived)
      const msg = { ...tradeMsg }
      const messageReceived = getMessage(msg)
      messageReceived.content.messageType = '####'

      await asyncFunction(endFunction)

      expect(mockEventTypeProcessor.processEvent).toHaveBeenCalledTimes(0)
      expect(loggerMock.error).toHaveBeenCalledTimes(1)
      expect(loggerMock.error).toHaveBeenCalledWith(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.MessageProcessingFailed,
        `Can't find message processor. Message processing failed. ACKing message`,
        {
          messageType: messageReceived.content.messageType,
          vaktId: 'E2389423'
        }
      )
      expect(messageReceived.ack).toHaveBeenCalledTimes(1)
    })

    describe('failure', () => {
      it('with an unhandled Error', async () => {
        const asyncFunction = createPollingMock.mock.calls[0][0]
        const endFunction = jest.fn()
        getMock.mockImplementation(() => messageReceived)
        const messageData: any = { ...tradeMsg }
        messageData.messageType = MESSAGE_TYPE.KOMGO_Trade_TradeData
        const messageReceived = getMessage(messageData)

        mockEventTypeProcessor.processEvent = jest.fn(() => {
          throw new Error('boom!')
        })

        await asyncFunction(endFunction)

        expect(mockEventTypeProcessor.processEvent).toHaveBeenCalledTimes(1)
        expect(loggerMock.error).toHaveBeenCalled()
        expect(loggerMock.error).toHaveBeenCalledWith(
          ErrorCode.ValidationInternalAMQP,
          ErrorName.MessageProcessingFailed,
          'Error processing message',
          {
            type: messageData.messageType,
            vaktId: tradeMsg.vaktId,
            err: 'boom!'
          }
        )
        expect(messageReceived.ack).toHaveBeenCalledTimes(1)
      })

      it('with an internal Error', async () => {
        const asyncFunction = createPollingMock.mock.calls[0][0]
        const endFunction = jest.fn()
        getMock.mockImplementation(() => messageReceived)
        const messageData: any = { ...tradeMsg }
        messageData.messageType = MESSAGE_TYPE.KOMGO_Trade_TradeData
        const messageReceived = getMessage(messageData)

        mockEventTypeProcessor.processEvent = jest.fn(() => {
          throw new Error('boom!')
        })

        await asyncFunction(endFunction)

        expect(mockEventTypeProcessor.processEvent).toHaveBeenCalledTimes(1)
        expect(loggerMock.error).toHaveBeenCalled()
        expect(loggerMock.error).toHaveBeenCalledWith(
          ErrorCode.ValidationInternalAMQP,
          ErrorName.MessageProcessingFailed,
          'Error processing message',
          {
            type: messageData.messageType,
            vaktId: tradeMsg.vaktId,
            err: 'boom!'
          }
        )
        expect(messageReceived.ack).toHaveBeenCalledTimes(1)
      })
    })
  })
})
