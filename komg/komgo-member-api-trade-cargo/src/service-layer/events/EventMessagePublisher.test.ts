import 'reflect-metadata'

import { ICargo, buildFakeCargo, buildFakeTrade } from '@komgo/types'

import { createMockInstance } from 'jest-create-mock-instance'
import { MessagingFactory } from '@komgo/messaging-library'
import { EventMessagePublisher } from './EventMessagePublisher'

const MESSAGE_ID = 'messageId'

describe('EventMessagePublisher', () => {
  let eventMessagePublisher: EventMessagePublisher
  let mockMessagingFactory: jest.Mocked<MessagingFactory>
  let mockMessagePublisher

  beforeEach(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)

    mockMessagePublisher = {
      publish: jest.fn().mockResolvedValue({ messageId: MESSAGE_ID })
    }

    mockMessagingFactory.createPublisher.mockReturnValue(mockMessagePublisher)

    eventMessagePublisher = new EventMessagePublisher(mockMessagingFactory, 'publisherId')
  })

  it('should return messageId if a Trade message is published', async () => {
    const result = await eventMessagePublisher.publishTradeUpdated(buildFakeTrade())

    expect(result).toBe(MESSAGE_ID)
  })

  it('should return messageId if a Cargo message is published', async () => {
    const result = await eventMessagePublisher.publishCargoUpdated(buildFakeCargo())

    expect(result).toBe(MESSAGE_ID)
  })
})
