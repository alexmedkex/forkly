import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { buildFakeRequestInternalPayload, buildFakeRequestInternalMessage } from './faker'
import InternalPublisher from './InternalPublisher'

// tslint:disable-next-line

const mockPublishCritical = jest.fn()
const mockMessagePublisher: IMessagePublisher = {
  publishCritical: mockPublishCritical,
  close: jest.fn(),
  publish: jest.fn()
}

describe('InternalPublisher', () => {
  let internalPublisher: InternalPublisher

  let messagingFactory: jest.Mocked<MessagingFactory>

  beforeEach(() => {
    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createRetryPublisher.mockReturnValueOnce(mockMessagePublisher)
    internalPublisher = new InternalPublisher('publisherId', 3, 300, messagingFactory)
  })

  it('should publish critical AMQP message routing Key', async () => {
    const mockMessageId = 'messageId'
    const mockRoutingKey = 'routingKey'
    const payload = buildFakeRequestInternalPayload()
    const message = buildFakeRequestInternalMessage(payload)
    mockPublishCritical.mockResolvedValue({
      messageId: mockMessageId
    })

    const messageId = await internalPublisher.send(mockRoutingKey, message)

    expect(messageId).toEqual(mockMessageId)
    expect(mockPublishCritical).toBeCalledTimes(1)
    expect(mockPublishCritical).toBeCalledWith(mockRoutingKey, message)
  })

  it('should throw error if publish fails', async () => {
    const mockRoutingKey = 'routingKey'
    const payload = buildFakeRequestInternalPayload()
    const message = buildFakeRequestInternalMessage(payload)
    mockPublishCritical.mockRejectedValue(new Error())

    expect.assertions(2)
    try {
      await internalPublisher.send(mockRoutingKey, message)
    } catch (e) {
      expect(mockPublishCritical).toBeCalledTimes(1)
      expect(mockPublishCritical).toBeCalledWith(mockRoutingKey, message)
    }
  })
})
