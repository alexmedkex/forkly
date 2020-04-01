import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { buildFakeRequestActionPayload, buildFakeRequestRFPMessage } from './faker'
import OutboundPublisher from './OutboundPublisher'
import { IRequestPayload, IRFPActionMessage } from './types'

// tslint:disable-next-line

const mockPublishCritical = jest.fn()
const mockMessagePublisher: IMessagePublisher = {
  publishCritical: mockPublishCritical,
  close: jest.fn(),
  publish: jest.fn()
}

describe('OutboundPublisher', () => {
  let outboundPublisher: OutboundPublisher

  let messagingFactory: jest.Mocked<MessagingFactory>

  beforeEach(() => {
    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createRetryPublisher.mockReturnValueOnce(mockMessagePublisher)
    outboundPublisher = new OutboundPublisher('publisherId', 3, 300, messagingFactory)
  })

  it('should publish critical AMQP message with recipientStaticId', async () => {
    const recipientStaticId = 'recipientStaticId'
    const mockMessageId = 'messageId'
    const payload: IRequestPayload = buildFakeRequestActionPayload()
    const message: IRFPActionMessage<IRequestPayload> = buildFakeRequestRFPMessage(payload)
    mockPublishCritical.mockResolvedValue({
      messageId: mockMessageId
    })

    const messageId = await outboundPublisher.send(recipientStaticId, message)

    expect(messageId).toEqual(mockMessageId)
    expect(mockPublishCritical).toBeCalledTimes(1)
    expect(mockPublishCritical).toBeCalledWith(
      message.messageType,
      message,
      expect.objectContaining({
        recipientStaticId
      })
    )
  })

  it('should throw error if publish fails', async () => {
    const recipientStaticId = 'recipientStaticId'
    const payload: IRequestPayload = buildFakeRequestActionPayload()
    const message: IRFPActionMessage<IRequestPayload> = buildFakeRequestRFPMessage(payload)
    mockPublishCritical.mockRejectedValue(new Error())

    expect.assertions(2)
    try {
      await outboundPublisher.send(recipientStaticId, message)
    } catch (e) {
      expect(mockPublishCritical).toBeCalledTimes(1)
      expect(mockPublishCritical).toBeCalledWith(
        message.messageType,
        message,
        expect.objectContaining({
          recipientStaticId
        })
      )
    }
  })
})
