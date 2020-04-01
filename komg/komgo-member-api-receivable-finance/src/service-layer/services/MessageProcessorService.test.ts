import { MessagingFactory, IConsumerWatchdog, IMessageReceived } from '@komgo/messaging-library'
import { TradeCargoRoutingKey, buildFakeDocumentReceivedMessage } from '@komgo/messaging-types'
import { buildFakeReceivablesDiscountingExtended, buildFakeTradeSnapshot } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { InvalidPayloadProcessingError, EntityNotFoundError } from '../../business-layer/errors'
import {
  buildFakeReceivableFinanceMessage,
  buildFakeRequestPayload,
  buildFakeRFPMessage,
  buildFakeAddDiscountingMessage
} from '../../business-layer/messaging/faker'
import { UpdateType } from '../../business-layer/types'

import { AddDiscountingMessageProcessor } from './AddDiscountingMessageProcessor'
import { DocumentMessageProcessor } from './DocumentMessageProcessor'
import { MessageProcessorService } from './MessageProcessorService'
import { RFPMessageProcessor } from './RFPMessageProcessor'
import { TradeCargoMessageProcessor } from './TradeCargoMessageProcessor'
import { UpdateMessageProcessor } from './UpdateMessageProcessor'

const mockAck = jest.fn()
const mockReject = jest.fn()
const mockRequeue = jest.fn()
const mockListen = jest.fn()
const mockListenMultiple = jest.fn()
const mockClose = jest.fn()
const mockConsumerWatchdog: IConsumerWatchdog = {
  listen: mockListen,
  listenMultiple: mockListenMultiple,
  close: mockClose
}

const MOCK_INBOUND_PUBLISHER_ID = 'inbound'
const MOCK_RFP_PUBLISHER_ID = 'rfp'
const MOCK_DOCUMENTS_PUBLISHER_ID = 'documents'
const MOCK_TRADE_CARGO_PUBLISHER_ID = 'trade-cargos'

const VALID_REQUEST_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.Request'
const MOCK_DOCUMENT_RECEIVED_ROUTING_KEY = 'INTERNAL.DOCUMENT.DocumentReceived.tradeFinance.rd'
const VALID_UPDATE_ROUTING_KEY = 'KOMGO.RD.UPDATE.ReceivablesDiscounting'
const MOCK_ADD_DISCOUNTING_ROUTING_KEY = 'KOMGO.RD.DiscountingRequest.Add'

const MOCK_CONSUMER_ID = 'api-rf'
const MOCK_CONSUMER_RETRIES = 3

const mockRD = buildFakeReceivablesDiscountingExtended()
const mockTradeSnapshot = buildFakeTradeSnapshot()

describe('MessageProcessorService', () => {
  let service: MessageProcessorService

  let messagingFactory: jest.Mocked<MessagingFactory>
  let rfpMessageProcessor: jest.Mocked<RFPMessageProcessor>
  let updateMessageProcessor: jest.Mocked<UpdateMessageProcessor>
  let tradeCargoMessageProcessor: jest.Mocked<TradeCargoMessageProcessor>
  let documentMessageProcessor: jest.Mocked<DocumentMessageProcessor>
  let addDiscountingMessageProcessor: jest.Mocked<AddDiscountingMessageProcessor>

  beforeEach(() => {
    jest.resetAllMocks() // need this to clear toBeCalledTimes()
    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createConsumerWatchdog.mockReturnValue(mockConsumerWatchdog)
    rfpMessageProcessor = createMockInstance(RFPMessageProcessor)
    updateMessageProcessor = createMockInstance(UpdateMessageProcessor)
    tradeCargoMessageProcessor = createMockInstance(TradeCargoMessageProcessor)
    documentMessageProcessor = createMockInstance(DocumentMessageProcessor)
    addDiscountingMessageProcessor = createMockInstance(AddDiscountingMessageProcessor)

    service = new MessageProcessorService(
      MOCK_CONSUMER_ID,
      MOCK_CONSUMER_RETRIES,
      MOCK_RFP_PUBLISHER_ID,
      MOCK_TRADE_CARGO_PUBLISHER_ID,
      MOCK_INBOUND_PUBLISHER_ID,
      MOCK_DOCUMENTS_PUBLISHER_ID,
      messagingFactory,
      rfpMessageProcessor,
      updateMessageProcessor,
      tradeCargoMessageProcessor,
      documentMessageProcessor,
      addDiscountingMessageProcessor
    )
  })

  describe('Success', () => {
    it('should process a valid Add discounting request message', async () => {
      const messageHandler = await captureInboundMessageReceivedHandler()
      const messageReceived: IMessageReceived = createAddDiscountingMessageReceived()

      await messageHandler(messageReceived)

      expect(addDiscountingMessageProcessor.process).toBeCalledWith(messageReceived)
    })

    it('should process a valid Update message', async () => {
      const messageHandler = await captureInboundMessageReceivedHandler()
      const messageReceived: IMessageReceived = createRDUpdateMessageReceived(UpdateType.ReceivablesDiscounting)

      await messageHandler(messageReceived)

      expect(updateMessageProcessor.process).toBeCalledWith(messageReceived)
    })

    it('should process a valid RFP message', async () => {
      const messageHandler = await captureInternalMessageReceivedHandler()
      const messageReceived: IMessageReceived = createRFPMessageReceived()

      await messageHandler(messageReceived)

      expect(rfpMessageProcessor.process).toBeCalledWith(messageReceived)
    })

    it('should process a valid Document message', async () => {
      const messageHandler = await captureDocumentMessageReceivedHandler()
      const messageReceived: IMessageReceived = createDocumentMessageReceived()

      await messageHandler(messageReceived)

      expect(documentMessageProcessor.process).toBeCalledWith(messageReceived)
    })
  })

  describe('reject', () => {
    it('should reject if InvalidPayloadProcessingError is thrown by the UpdateMessageProcessor', async () => {
      const messageHandler = await captureInboundMessageReceivedHandler()
      const messageReceived: IMessageReceived = createRDUpdateMessageReceived(UpdateType.ReceivablesDiscounting)
      updateMessageProcessor.process.mockRejectedValueOnce(new InvalidPayloadProcessingError(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(updateMessageProcessor.process).toBeCalledTimes(1)
    })

    it('should reject if InvalidPayloadProcessingError is thrown by the RFPMessageProcessor', async () => {
      const messageHandler = await captureInternalMessageReceivedHandler()
      const messageReceived: IMessageReceived = createRFPMessageReceived()
      rfpMessageProcessor.process.mockRejectedValueOnce(new InvalidPayloadProcessingError(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(rfpMessageProcessor.process).toBeCalledTimes(1)
    })

    it('should reject if EntityNotFoundError is thrown by the TradeCargoMessageProcessor', async () => {
      const messageHandler = await captureTradeCargoMessageReceivedHandler()
      const messageReceived: IMessageReceived = createTradeCargoMessageReceived()
      tradeCargoMessageProcessor.process.mockRejectedValueOnce(new EntityNotFoundError(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(tradeCargoMessageProcessor.process).toBeCalledTimes(1)
    })

    it('should reject if InvalidPayloadProcessingError is thrown by the DocumentMessageProcessor', async () => {
      const messageHandler = await captureDocumentMessageReceivedHandler()
      const messageReceived: IMessageReceived = createDocumentMessageReceived()
      documentMessageProcessor.process.mockRejectedValueOnce(new EntityNotFoundError(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(documentMessageProcessor.process).toBeCalledTimes(1)
    })
  })

  describe('requeue', () => {
    it('should mockRequeue if UpdateMessageProcessor throws an Unknown error', async () => {
      const messageHandler = await captureInboundMessageReceivedHandler()
      const messageReceived: IMessageReceived = createRDUpdateMessageReceived(UpdateType.ReceivablesDiscounting)
      updateMessageProcessor.process.mockRejectedValueOnce(new Error(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(1)
      expect(updateMessageProcessor.process).toBeCalledTimes(1)
    })

    it('should mockRequeue if RFPMessageProcessor throws an Unknown error', async () => {
      const messageHandler = await captureInternalMessageReceivedHandler()
      const messageReceived: IMessageReceived = createRFPMessageReceived()
      rfpMessageProcessor.process.mockRejectedValueOnce(new Error(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(1)
      expect(rfpMessageProcessor.process).toBeCalledTimes(1)
    })

    it('should requeue if DocumentMessageProcessor throws an Unknown error', async () => {
      const messageHandler = await captureDocumentMessageReceivedHandler()
      const messageReceived: IMessageReceived = createDocumentMessageReceived()
      documentMessageProcessor.process.mockRejectedValueOnce(new Error(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(1)
      expect(documentMessageProcessor.process).toBeCalledTimes(1)
    })
  })

  it('should close consumer', async () => {
    await service.stop()

    expect(mockClose).toBeCalledTimes(1)
  })

  async function captureInternalMessageReceivedHandler() {
    await service.start()
    expect(mockListen).toBeCalledWith(MOCK_RFP_PUBLISHER_ID, `INTERNAL.RFP.tradeFinance.rd.#`, expect.anything())
    return mockListen.mock.calls[0][2]
  }

  async function captureDocumentMessageReceivedHandler() {
    await service.start()
    expect(mockListen).toBeCalledWith(
      MOCK_DOCUMENTS_PUBLISHER_ID,
      'INTERNAL.DOCUMENT.DocumentReceived.tradeFinance.#',
      expect.anything()
    )
    return mockListen.mock.calls[1][2]
  }

  async function captureInboundMessageReceivedHandler() {
    await service.start()
    expect(mockListenMultiple).toBeCalledWith(
      MOCK_INBOUND_PUBLISHER_ID,
      ['KOMGO.RD.UPDATE.#', 'KOMGO.RD.DiscountingRequest.#'],
      expect.anything()
    )
    return mockListenMultiple.mock.calls[0][2]
  }

  async function captureTradeCargoMessageReceivedHandler() {
    await service.start()
    expect(mockListenMultiple).toBeCalledWith(MOCK_TRADE_CARGO_PUBLISHER_ID, expect.anything(), expect.anything())
    return mockListenMultiple.mock.calls[1][2]
  }

  function createRDUpdateMessageReceived(updateType: UpdateType): IMessageReceived {
    const rd = buildFakeReceivablesDiscountingExtended()
    const rfMsg = buildFakeReceivableFinanceMessage(rd, updateType)

    return createMessageReceived(rfMsg, VALID_UPDATE_ROUTING_KEY)
  }

  function createRFPMessageReceived(): IMessageReceived {
    const rfpMessage = buildFakeRFPMessage(buildFakeRequestPayload(mockRD, mockTradeSnapshot))
    return createMessageReceived(rfpMessage, VALID_REQUEST_ROUTING_KEY)
  }

  function createAddDiscountingMessageReceived(): IMessageReceived {
    const addDiscountingMessage = buildFakeAddDiscountingMessage(mockRD.staticId, mockRD)
    return createMessageReceived(addDiscountingMessage, MOCK_ADD_DISCOUNTING_ROUTING_KEY)
  }

  function createDocumentMessageReceived(): IMessageReceived {
    const docMessage = buildFakeDocumentReceivedMessage()
    return createMessageReceived(docMessage, MOCK_DOCUMENT_RECEIVED_ROUTING_KEY)
  }

  function createTradeCargoMessageReceived(): IMessageReceived {
    return createMessageReceived({}, TradeCargoRoutingKey.TradeUpdated)
  }

  function createMessageReceived(content: any, routingKey: string): IMessageReceived {
    return {
      content,
      routingKey,
      options: {
        messageId: 'messageId'
      },
      ack: mockAck,
      reject: mockReject,
      requeue: mockRequeue
    }
  }
})
