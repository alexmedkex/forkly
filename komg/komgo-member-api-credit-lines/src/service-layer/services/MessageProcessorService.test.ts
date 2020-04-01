import { MessagingFactory, IConsumerWatchdog, IMessageReceived } from '@komgo/messaging-library'
import { Currency } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { FeatureType } from '../../business-layer/enums/feature'
import { InvalidPayloadProcessingError } from '../../business-layer/errors/InvalidPayloadProcessingError'
import { ISharedCreditLineMessage } from '../../business-layer/messaging/messages/IShareCreditLineMessage'
import { IMessage } from '../../business-layer/messaging/messages/Message'
import { MessageType } from '../../business-layer/messaging/MessageTypes'
import { IEventProcessorBase } from '../../business-layer/messaging/processor/IEventProcessor'

import MessageProcessorService from './MessageProcessorService'

let mockAck = jest.fn()
let mockReject = jest.fn()
let mockRequeue = jest.fn()
let mockListen = jest.fn()
let mockClose = jest.fn()
let mockConsumerWatchdog: IConsumerWatchdog = {
  listen: mockListen,
  listenMultiple: mockListen,
  close: mockClose
}

const MOCK_PUBLISHER_ID = 'CreditLines'
const VALID_DISCLOSE_ROUTING_KEY = 'KOMGO.CreditLines.Share'
const VALID_REVOKE_ROUTING_KEY = 'KOMGO.CreditLines.Revoke'
const INVALID_ROUTING_KEY = 'KOMGO.CreditLines.Unknown'

const MOCK_CONSUMER_ID = 'api-credit-lines'
const MOCK_CONSUMER_RETRIES = 3

const mockMessage: ISharedCreditLineMessage = {
  version: 1,
  messageType: MessageType.ShareCreditLine,
  staticId: '1',
  ownerStaticId: '1',
  recepientStaticId: '2',
  featureType: FeatureType.BankLine,
  payload: {
    context: {
      productId: '111',
      subProductId: '222'
    },
    counterpartyStaticId: '3',
    data: {
      appetite: true,
      currency: Currency.USD,
      availability: true,
      availabilityAmount: 100
    }
  }
}

describe('MessageProcessorService', () => {
  let service: MessageProcessorService

  let messagingFactory: jest.Mocked<MessagingFactory>
  let shareEventProcessor: jest.Mocked<IEventProcessorBase>
  let revokeEventProcessor: jest.Mocked<IEventProcessorBase>

  beforeEach(() => {
    mockAck = jest.fn()
    mockReject = jest.fn()
    mockRequeue = jest.fn()
    mockListen = jest.fn()
    mockClose = jest.fn()
    mockConsumerWatchdog = {
      listen: mockListen,
      listenMultiple: mockListen,
      close: mockClose
    }

    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createConsumerWatchdog.mockReturnValue(mockConsumerWatchdog)

    shareEventProcessor = {
      messageType: MessageType.ShareCreditLine,
      processMessage: jest.fn(),
      shouldProcess: jest.fn(message => message.messageType === MessageType.ShareCreditLine)
    }
    revokeEventProcessor = {
      messageType: MessageType.RevokeCreditLine,
      processMessage: jest.fn(),
      shouldProcess: jest.fn(message => message.messageType === MessageType.RevokeCreditLine)
    }

    service = new MessageProcessorService(
      MOCK_CONSUMER_ID,
      MOCK_CONSUMER_RETRIES,
      MOCK_PUBLISHER_ID,
      messagingFactory,
      [shareEventProcessor, revokeEventProcessor]
    )
  })

  // it('test routing keys', async () => {
  //   // await service.stop()
  //   let messageReceived: IMessageReceived = createMessageReceived(mockMessage, VALID_DISCLOSE_ROUTING_KEY)
  //   expect(service.isRoutingKeySupported(messageReceived)).toBeTruthy()
  //   messageReceived = createMessageReceived(mockMessage, VALID_UPDATE_ROUTING_KEY)
  //   expect(service.isRoutingKeySupported(messageReceived)).toBeTruthy()
  //   messageReceived = createMessageReceived(mockMessage, INVALID_ROUTING_KEY)
  //   expect(service.isRoutingKeySupported(messageReceived)).toBeFalsy()
  // })

  describe('ack disclosed', () => {
    beforeEach(async () => {
      shareEventProcessor.processMessage = jest.fn()
      revokeEventProcessor.processMessage = jest.fn()
    })

    it('should process valid disclose message', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const messageReceived: IMessageReceived = createMessageReceived(mockMessage, VALID_DISCLOSE_ROUTING_KEY)
      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(shareEventProcessor.processMessage).toBeCalledTimes(1)
      expect(shareEventProcessor.processMessage).toBeCalledWith(messageReceived.content)
    })
  })

  describe('ack update', () => {
    beforeEach(() => {
      shareEventProcessor.processMessage = jest.fn()
      revokeEventProcessor.processMessage = jest.fn()
    })

    it('should process valid update message', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const messageReceived: IMessageReceived = createMessageReceived(mockMessage, VALID_DISCLOSE_ROUTING_KEY)
      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(shareEventProcessor.processMessage).toBeCalledTimes(1)
      expect(shareEventProcessor.processMessage).toBeCalledWith(messageReceived.content)
    })
  })

  describe('reject', () => {
    beforeEach(() => {
      shareEventProcessor.processMessage = jest.fn()
      revokeEventProcessor.processMessage = jest.fn()
    })

    it('should reject if has invalid routingKey', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const messageReceived: IMessageReceived = createMessageReceived(mockMessage, INVALID_ROUTING_KEY)

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(revokeEventProcessor.processMessage).not.toBeCalled()
      expect(shareEventProcessor.processMessage).not.toBeCalled()
    })

    it('should reject if FailedProcessRequestMessageError is thrown by Use Case', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const messageReceived: IMessageReceived = createMessageReceived(mockMessage, VALID_DISCLOSE_ROUTING_KEY)
      shareEventProcessor.processMessage.mockRejectedValueOnce(new InvalidPayloadProcessingError(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(shareEventProcessor.processMessage).toBeCalledTimes(1)
    })
  })

  describe('requeue', () => {
    it('should reject if an Unknown error is thrown', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const messageReceived: IMessageReceived = createMessageReceived(mockMessage, VALID_DISCLOSE_ROUTING_KEY)
      shareEventProcessor.processMessage.mockRejectedValueOnce(new Error(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(1)
      expect(shareEventProcessor.processMessage).toBeCalledTimes(1)
    })
  })

  it('should close consumer', async () => {
    await service.stop()

    expect(mockClose).toBeCalledTimes(1)
  })

  async function captureMessageReceivedHandler() {
    await service.start()
    expect(mockListen).toBeCalledWith(MOCK_PUBLISHER_ID, expect.anything(), expect.anything())
    return mockListen.mock.calls[0][2]
  }

  function createMessageReceived(message: IMessage, routingKey: string): IMessageReceived {
    return {
      content: message,
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
