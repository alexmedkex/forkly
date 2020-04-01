import 'reflect-metadata'

// tslint:disable-next-line:no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  metric: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import { RequestClient, MessageSendingError } from './RequestClient'
import { MessagingFactory } from '@komgo/messaging-library'
import CounterpartyRequestMessage from './messages/CounterpartyRequestMessage'
import { MESSAGE_TYPE } from './MessageTypes'

let requestClient: RequestClient
const companyId = '1234'

const message: CounterpartyRequestMessage = {
  version: 1,
  messageType: '',
  context: {
    requestId: '1234'
  },
  data: {
    requestId: '1234',
    requesterCompanyId: '4444',
    receiverCompanyId: '1234'
  }
}

let mockMessagingFactory: jest.Mocked<MessagingFactory>

const mockMessagePublisher = {
  register: jest.fn(),
  close: jest.fn(),
  publish: jest.fn(),
  publishCritical: jest.fn(() => ({ controlFlow: true }))
}

describe('EventsProcessor', () => {
  beforeEach(() => {
    mockMessagePublisher.publishCritical = jest.fn(() => ({ controlFlow: true }))
    mockMessagingFactory = createMockInstance(MessagingFactory)

    mockMessagingFactory.createRetryPublisher.mockImplementation(() => {
      return mockMessagePublisher
    })
    requestClient = new RequestClient(mockMessagingFactory, '')

    loggerMock.info.mockClear()
    loggerMock.warn.mockClear()
    loggerMock.error.mockClear()
    loggerMock.metric.mockClear()
  })

  it('sendConnectRequest', async () => {
    await requestClient.sendCommonRequest(MESSAGE_TYPE.ConnectRequest, companyId, message)

    validateCommonRequest(MESSAGE_TYPE.ConnectRequest, companyId, mockMessagePublisher)
  })

  it('sendApproveRequest', async () => {
    await requestClient.sendCommonRequest(MESSAGE_TYPE.ApproveConnectRequest, companyId, message)

    validateCommonRequest(MESSAGE_TYPE.ApproveConnectRequest, companyId, mockMessagePublisher)
  })

  it('throw error on publish critical', async () => {
    mockMessagePublisher.publishCritical = jest.fn(() => {
      throw Error('Publish error')
    })
    expect(requestClient.sendCommonRequest(MESSAGE_TYPE.ApproveConnectRequest, companyId, message)).rejects.toThrow(
      new MessageSendingError('Publish error')
    )
  })

  it('throw error not controll flow', async () => {
    mockMessagePublisher.publishCritical = jest.fn(() => ({ controlFlow: false }))
    expect(requestClient.sendCommonRequest(MESSAGE_TYPE.ApproveConnectRequest, companyId, message)).rejects.toThrow(
      new MessageSendingError('Failed to publish counterparty request')
    )
  })

  function validateCommonRequest(messageType: MESSAGE_TYPE, company, publisher) {
    const call = publisher.publishCritical.mock.calls[0]
    expect(call[0]).toBe(messageType)
    expect(call[2]).toEqual({
      recipientStaticId: company
    })
  }
})
