import { IConsumerWatchdog, IMessageReceived, MessagingFactory } from '@komgo/messaging-library'
import { RFPMessageType, IRFPMessage } from '@komgo/messaging-types'
import {
  buildFakeQuote,
  buildFakeReceivablesDiscountingExtended,
  ReplyType,
  buildFakeTradeSnapshot
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceiveMessageUseCaseFactory } from '../../business-layer/messaging'
import {
  buildFakeRequestPayload,
  buildFakeResponsePayload,
  buildFakeRFPMessage
} from '../../business-layer/messaging/faker'
import {
  ReceiveAcceptMessageUseCase,
  ReceiveDeclineMessageUseCase,
  ReceiveRequestMessageUseCase,
  ReceiveResponseMessageUseCase
} from '../../business-layer/rfp/use-cases'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'

import { RFPMessageProcessor } from './RFPMessageProcessor'

const mockAck = jest.fn()
const mockReject = jest.fn()
const mockRequeue = jest.fn()
const mockListen = jest.fn()
const mockClose = jest.fn()
const mockConsumerWatchdog: IConsumerWatchdog = {
  listen: mockListen,
  listenMultiple: jest.fn(),
  close: mockClose
}

const VALID_ACCEPT_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.Accept'
const VALID_DECLINE_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.Decline'
const VALID_REQUEST_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.Request'
const VALID_RESPONSE_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.Response'
const VALID_REJECT_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.Reject'
const INVALID_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.SomethingElse'

const mockRD = buildFakeReceivablesDiscountingExtended()
const mockTradeSnapshot = buildFakeTradeSnapshot()
const mockRFPReplyAccept = buildFakeReply({ type: ReplyType.Accepted })
const mockRFPReplyDecline = buildFakeReply({ type: ReplyType.Declined })
const mockRFPReplySubmit = buildFakeReply({ type: ReplyType.Submitted })
const mockRFPReplyReject = buildFakeReply({ type: ReplyType.Reject })
const mockQuote = buildFakeQuote()

describe('RFPMessageProcessor', () => {
  let messagingFactory: jest.Mocked<MessagingFactory>
  let receiveRequestMessageUseCase: jest.Mocked<ReceiveRequestMessageUseCase>
  let receiveResponseMessageUseCase: jest.Mocked<ReceiveResponseMessageUseCase>
  let receiveAcceptMessageUseCase: jest.Mocked<ReceiveAcceptMessageUseCase>
  let receiveDeclineMessageUseCase: jest.Mocked<ReceiveDeclineMessageUseCase>
  let receiveMessageUseCaseFactory: jest.Mocked<ReceiveMessageUseCaseFactory>
  let rfpMessageProcessor: RFPMessageProcessor

  beforeEach(() => {
    jest.resetAllMocks() // need this to clear toBeCalledTimes()
    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createConsumerWatchdog.mockReturnValue(mockConsumerWatchdog)
    receiveRequestMessageUseCase = createMockInstance(ReceiveRequestMessageUseCase)
    receiveResponseMessageUseCase = createMockInstance(ReceiveResponseMessageUseCase)
    receiveAcceptMessageUseCase = createMockInstance(ReceiveAcceptMessageUseCase)
    receiveDeclineMessageUseCase = createMockInstance(ReceiveDeclineMessageUseCase)
    receiveMessageUseCaseFactory = createMockInstance(ReceiveMessageUseCaseFactory)

    rfpMessageProcessor = new RFPMessageProcessor(receiveMessageUseCaseFactory)
  })

  it('should still ack message if there is no appropriate use case', async () => {
    const rfpMessage = buildFakeRFPMessage(buildFakeRequestPayload(mockRD, mockTradeSnapshot))
    const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, VALID_REQUEST_ROUTING_KEY)

    await rfpMessageProcessor.process(messageReceived)

    expect(mockAck).toBeCalledTimes(1)
  })

  describe('ack request', () => {
    beforeEach(() => {
      receiveMessageUseCaseFactory.getUseCase.mockReturnValueOnce(receiveRequestMessageUseCase)
    })

    it('should process valid RFP Request message', async () => {
      const rfpMessage = buildFakeRFPMessage(buildFakeRequestPayload(mockRD, mockTradeSnapshot))
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, VALID_REQUEST_ROUTING_KEY)

      await rfpMessageProcessor.process(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveMessageUseCaseFactory.getUseCase).toBeCalledWith(RFPMessageType.Request)
      expect(receiveRequestMessageUseCase.execute).toBeCalledTimes(1)
      expect(receiveRequestMessageUseCase.execute).toBeCalledWith(messageReceived.content)
    })
  })

  describe('ack accept', () => {
    beforeEach(() => {
      receiveMessageUseCaseFactory.getUseCase.mockReturnValueOnce(receiveAcceptMessageUseCase)
    })

    it('should process valid RFP Accept message', async () => {
      const rfpMessage = buildFakeRFPMessage(buildFakeResponsePayload(mockRFPReplyAccept, mockQuote))
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, VALID_ACCEPT_ROUTING_KEY)

      await rfpMessageProcessor.process(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveMessageUseCaseFactory.getUseCase).toBeCalledWith(RFPMessageType.Accept)
      expect(receiveAcceptMessageUseCase.execute).toBeCalledTimes(1)
      expect(receiveAcceptMessageUseCase.execute).toBeCalledWith(messageReceived.content)
    })
  })

  describe('ack decline', () => {
    beforeEach(() => {
      receiveMessageUseCaseFactory.getUseCase.mockReturnValueOnce(receiveDeclineMessageUseCase)
    })

    it('should process valid RFP Decline message', async () => {
      const rfpMessage = buildFakeRFPMessage(buildFakeResponsePayload(mockRFPReplyDecline, mockQuote))
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, VALID_DECLINE_ROUTING_KEY)

      await rfpMessageProcessor.process(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveMessageUseCaseFactory.getUseCase).toBeCalledWith(RFPMessageType.Decline)
      expect(receiveDeclineMessageUseCase.execute).toBeCalledTimes(1)
      expect(receiveDeclineMessageUseCase.execute).toBeCalledWith(messageReceived.content)
    })
  })

  describe('ack response/reject', () => {
    beforeEach(() => {
      receiveMessageUseCaseFactory.getUseCase.mockReturnValueOnce(receiveResponseMessageUseCase)
    })

    it('should process valid RFP Response message', async () => {
      const rfpMessage = buildFakeRFPMessage(buildFakeResponsePayload(mockRFPReplySubmit, mockQuote))
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, VALID_RESPONSE_ROUTING_KEY)

      await rfpMessageProcessor.process(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveResponseMessageUseCase.execute).toBeCalledTimes(1)
      expect(receiveResponseMessageUseCase.execute).toBeCalledWith(messageReceived.content)
    })

    it('should process valid RFP Reject message', async () => {
      const rfpMessage = buildFakeRFPMessage(buildFakeResponsePayload(mockRFPReplyReject, mockQuote))
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, VALID_REJECT_ROUTING_KEY)

      await rfpMessageProcessor.process(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveMessageUseCaseFactory.getUseCase).toBeCalledWith(RFPMessageType.Reject)
      expect(receiveResponseMessageUseCase.execute).toBeCalledTimes(1)
      expect(receiveResponseMessageUseCase.execute).toBeCalledWith(messageReceived.content)
    })
  })

  describe('reject', () => {
    beforeEach(() => {
      receiveMessageUseCaseFactory.getUseCase.mockReturnValueOnce(receiveRequestMessageUseCase)
    })

    it('should reject if has invalid INTERNAL routingKey', async () => {
      const rfpMessage = buildFakeRFPMessage(buildFakeRequestPayload(mockRD, mockTradeSnapshot))
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, INVALID_ROUTING_KEY)

      await rfpMessageProcessor.process(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveMessageUseCaseFactory.getUseCase).toBeCalledTimes(0)
      expect(receiveRequestMessageUseCase.execute).toBeCalledTimes(0)
    })
  })

  function createMessageReceived(rfpMessage: IRFPMessage<any>, routingKey: string): IMessageReceived {
    return {
      content: rfpMessage,
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
