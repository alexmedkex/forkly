import 'reflect-metadata'

const loggerMock = {
  warn: jest.fn(),
  info: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import { ErrorCode } from '@komgo/error-utilities'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'

import { COMPANY_ID } from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { ErrorName } from '../../utils/ErrorName'

import MessagingError from './MessagingError'

import { RabbitMQPublishingClient } from './RabbitMQPublishingClient'

const MESSAGE_ID = 'message-id'
const PUBLISHER_ID = 'publisher-id'
const RECIPIENT_STATIC_ID = 'recipient-company-static-id'
const ROUTING_KEY = 'routing-key'

const SUCCESSFUL_MESSAGE = {
  controlFlow: true,
  messageId: MESSAGE_ID
}

const FAILED_MESSAGE = {
  controlFlow: false,
  messageId: MESSAGE_ID
}

const message = {
  key: 'value'
}

const bufferFullLog = {
  errorMessage: 'RabbitMQ buffer is full',
  messageId: MESSAGE_ID,
  messageOptions: {
    recipientStaticId: RECIPIENT_STATIC_ID,
    senderStaticId: COMPANY_ID
  },
  routingKey: ROUTING_KEY
}

const messagingFactory = mock(MessagingFactory)

const publisher: IMessagePublisher = {
  publish: jest.fn(),
  publishCritical: jest.fn(),
  close: jest.fn()
}

describe('RabbitMQPublishingClient.test.ts', () => {
  let publishingClient

  beforeEach(() => {
    // We do not reset the mocks in this case to allow the mock injection of the logger

    messagingFactory.createRetryPublisher.mockReturnValue(publisher)
    publisher.publishCritical.mockReturnValue(SUCCESSFUL_MESSAGE)

    publishingClient = new RabbitMQPublishingClient(PUBLISHER_ID, COMPANY_ID, messagingFactory)
  })

  it('connects to RabbitMQ when sends first message', async () => {
    await publishingClient.sendMessage(ROUTING_KEY, RECIPIENT_STATIC_ID, message)

    expect(loggerMock.info).toHaveBeenCalled()

    expect(publisher.publishCritical).toBeCalledWith(ROUTING_KEY, message, {
      recipientStaticId: RECIPIENT_STATIC_ID,
      senderStaticId: COMPANY_ID
    })
  })

  it('logs a warning message if RabbitMQ buffer is full', async () => {
    publisher.publishCritical.mockReturnValue(FAILED_MESSAGE)

    await publishingClient.sendMessage(ROUTING_KEY, RECIPIENT_STATIC_ID, message)

    expect(loggerMock.warn).toHaveBeenCalledWith(
      ErrorCode.ConnectionInternalMQ,
      ErrorName.MQBufferFullError,
      bufferFullLog.errorMessage,
      bufferFullLog
    )
  })
})
