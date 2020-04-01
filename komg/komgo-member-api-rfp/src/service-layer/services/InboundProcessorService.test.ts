import { IConsumerWatchdog, IMessageReceived, MessagingFactory } from '@komgo/messaging-library'
import { ActionType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import FailedProcessActionError from '../../business-layer/errors/FailedProcessActionError'
import ReceiveInboundCorporateReplyUseCase from '../../business-layer/inbound-actions/corporate/ReceiveInboundCorporateReplyUseCase'
import InboundUseCaseFactory from '../../business-layer/inbound-actions/InboundUseCaseFactory'
import { OUTBOUND_MESSAGE_TYPE_PREFIX } from '../../business-layer/messaging/constants'
import {
  buildFakeReplyRFPMessage,
  buildFakeRequestActionPayload,
  buildFakeRequestRFPMessage,
  buildFakeReplyActionPayload,
  MOCK_RECIPIENT_STATIC_ID
} from '../../business-layer/messaging/faker'
import InvalidActionTypeError from '../../business-layer/messaging/InvalidActionTypeError'
import { IActionPayload, IRFPActionMessage } from '../../business-layer/messaging/types'
import { buildMessageType } from '../../business-layer/messaging/utils'

import InboundProcessorService from './InboundProcessorService'

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

const MOCK_INBOUND_PUBLISHER_ID = 'inboundPublisherId'

describe('InboundProcessorService', () => {
  let service: InboundProcessorService

  let messagingFactory: jest.Mocked<MessagingFactory>
  let receiveInboundRequestUseCase: jest.Mocked<ReceiveInboundCorporateReplyUseCase>
  let receiveInboundCorporateReplyUseCase: jest.Mocked<ReceiveInboundCorporateReplyUseCase>
  let inboundFactory: jest.Mocked<InboundUseCaseFactory>

  beforeEach(() => {
    jest.resetAllMocks() // need this to clear toBeCalledTimes()
    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createConsumerWatchdog.mockReturnValue(mockConsumerWatchdog)
    receiveInboundRequestUseCase = createMockInstance(ReceiveInboundCorporateReplyUseCase)
    receiveInboundCorporateReplyUseCase = createMockInstance(ReceiveInboundCorporateReplyUseCase)
    inboundFactory = createMockInstance(InboundUseCaseFactory)

    service = new InboundProcessorService(
      'inboundConsumerId',
      3,
      MOCK_INBOUND_PUBLISHER_ID,
      MOCK_RECIPIENT_STATIC_ID,
      messagingFactory,
      inboundFactory
    )
  })

  describe('ack', () => {
    it('should process valid RFP Request message', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundRequestUseCase)

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundRequestUseCase.execute).toBeCalledWith(rfpMessage, ActionType.Request)
    })

    it('should process valid RFP Response message', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeReplyRFPMessage(buildFakeReplyActionPayload(), ActionType.Response)
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundCorporateReplyUseCase)

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundCorporateReplyUseCase.execute).toBeCalledWith(rfpMessage, ActionType.Response)
    })

    it('should process valid RFP Reject message', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeReplyRFPMessage(buildFakeReplyActionPayload(), ActionType.Reject)
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundCorporateReplyUseCase)

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(1)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundCorporateReplyUseCase.execute).toBeCalledWith(rfpMessage, ActionType.Reject)
    })
  })

  describe('reject', () => {
    it('should reject if message has invalid routing type', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage, 'KOMGO.RFP.InvalidOne')

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundRequestUseCase.execute).toBeCalledTimes(0)
    })

    it('should reject if message has invalid message type', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      rfpMessage.messageType = 'KOMGO.RFP.InvalidOne'
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundRequestUseCase)

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundRequestUseCase.execute).toBeCalledTimes(0)
    })

    it('should reject if message recipientStaticId is not the companyStaticId', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      rfpMessage.data.rfp.recipientStaticID = 'someoneelse'
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundRequestUseCase)

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundRequestUseCase.execute).toBeCalledTimes(0)
    })

    it('should reject if failed to process request', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundRequestUseCase)
      receiveInboundRequestUseCase.execute.mockRejectedValueOnce(new FailedProcessActionError(''))

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
      expect(receiveInboundRequestUseCase.execute).toBeCalledWith(rfpMessage, ActionType.Request)
    })

    it('should reject if no usecase for messageType is found', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockImplementationOnce(() => {
        throw new InvalidActionTypeError('')
      })

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(1)
      expect(mockRequeue).toBeCalledTimes(0)
    })
  })

  describe('requeue', () => {
    it('should requeue if throws generic error', async () => {
      const messageHandler = await captureMessageReceivedHandler()
      const rfpMessage = buildFakeRequestRFPMessage(buildFakeRequestActionPayload())
      const messageReceived: IMessageReceived = createMessageReceived(rfpMessage)
      inboundFactory.getUseCase.mockReturnValueOnce(receiveInboundRequestUseCase)
      receiveInboundRequestUseCase.execute.mockRejectedValueOnce(new Error())

      await messageHandler(messageReceived)

      expect(mockAck).toBeCalledTimes(0)
      expect(mockReject).toBeCalledTimes(0)
      expect(mockRequeue).toBeCalledTimes(1)
      expect(receiveInboundRequestUseCase.execute).toBeCalledTimes(1)
      expect(receiveInboundRequestUseCase.execute).toBeCalledWith(rfpMessage, ActionType.Request)
    })
  })

  it('should close consumer', async () => {
    await service.stop()

    expect(mockClose).toBeCalledTimes(1)
  })

  async function captureMessageReceivedHandler() {
    await service.start()
    expect(mockListen).toBeCalledWith(MOCK_INBOUND_PUBLISHER_ID, `${OUTBOUND_MESSAGE_TYPE_PREFIX}#`, expect.anything())
    return mockListen.mock.calls[0][2]
  }

  function createMessageReceived(
    rfpMessage: IRFPActionMessage<IActionPayload>,
    messageType = buildMessageType(ActionType.Request)
  ): IMessageReceived {
    return {
      content: rfpMessage,
      routingKey: messageType,
      options: {
        messageId: 'messageId'
      },
      ack: mockAck,
      reject: mockReject,
      requeue: mockRequeue
    }
  }
})
