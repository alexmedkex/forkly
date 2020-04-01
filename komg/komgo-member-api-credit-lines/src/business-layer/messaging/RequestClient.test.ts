import { MessagingFactory } from '@komgo/messaging-library'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { IMessage } from './messages/Message'
import { MessageType } from './MessageTypes'
import { RequestClient, MessageSendingError } from './RequestClient'

let requestClient: RequestClient
const companyId = '1234'

const message: IMessage = {
  version: 1,
  messageType: 'message',
  context: { productId: 'trade-finance', subProductId: '' }
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
      return mockMessagePublisher as any
    })
    requestClient = new RequestClient(mockMessagingFactory, '')
  })

  it('disclose request', async () => {
    await requestClient.sendCommonRequest(MessageType.ShareCreditLine, companyId, message)

    validateCommonRequest(MessageType.ShareCreditLine, companyId, mockMessagePublisher)
  })

  it('revoke request', async () => {
    await requestClient.sendCommonRequest(MessageType.RevokeCreditLine, companyId, message)

    validateCommonRequest(MessageType.RevokeCreditLine, companyId, mockMessagePublisher)
  })

  it('throw error on publish critical', async () => {
    mockMessagePublisher.publishCritical = jest.fn(() => {
      throw Error('Publish error')
    })
    expect(requestClient.sendCommonRequest(MessageType.ShareCreditLine, companyId, message)).rejects.toThrow(
      new MessageSendingError('Publish error')
    )
  })

  function validateCommonRequest(messageType: MessageType, company, publisher) {
    const call = publisher.publishCritical.mock.calls[0]
    expect(call[0]).toBe(messageType)
    expect(call[2]).toEqual({
      recipientStaticId: company
    })
  }
})
