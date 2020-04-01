import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { OutboundPublisherError } from '../errors'
import { IReceivableFinanceMessage, UpdateType } from '../types'

import { buildFakeReceivableFinanceMessage } from './faker'
import { OutboundPublisher } from './OutboundPublisher'

const mockPublishCritical = jest.fn()
const mockMessagePublisher: IMessagePublisher = {
  publishCritical: mockPublishCritical,
  close: jest.fn(),
  publish: jest.fn()
}

describe('OutboundPublisher', () => {
  let outboundPublisher: OutboundPublisher

  let messagingFactory: jest.Mocked<MessagingFactory>
  let message: IReceivableFinanceMessage<any>

  beforeEach(() => {
    messagingFactory = createMockInstance(MessagingFactory)
    messagingFactory.createRetryPublisher.mockReturnValueOnce(mockMessagePublisher)
    outboundPublisher = new OutboundPublisher('publisherId', 3, 300, messagingFactory)

    const rd = buildFakeReceivablesDiscountingExtended()
    message = buildFakeReceivableFinanceMessage(rd, UpdateType.ReceivablesDiscounting)
  })

  describe('send', () => {
    it('should publish critical AMQP message with recipientStaticId', async () => {
      const recipientStaticId = 'recipientStaticId'
      const mockMessageId = 'messageId'

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

    it('should throw FailedShareError if publish fails', async () => {
      const recipientStaticId = 'recipientStaticId'

      mockPublishCritical.mockRejectedValue(new Error())

      await expect(outboundPublisher.send(recipientStaticId, message)).rejects.toThrowError(OutboundPublisherError)
      expect(mockPublishCritical).toBeCalledWith(
        message.messageType,
        message,
        expect.objectContaining({
          recipientStaticId
        })
      )
    })
  })
})
