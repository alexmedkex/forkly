import 'reflect-metadata'
import { VaktMessagingManager, IVaktMessagingManager } from './VaktMessagingManager'
import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import createMockInstance from 'jest-create-mock-instance'
import { VaktMessagingFactoryManager, IVaktMessagingFactoryManager } from './VaktMessagingFactoryManager'
import { LCMessageType, IHeadersType } from './messageTypes'
import { sampleLC } from './mock-data/mock-lc'

let mockMessagingFactory: jest.Mocked<MessagingFactory>

const mockMessagePublisher: IMessagePublisher = {
  close: jest.fn(),
  publish: jest.fn(),
  publishCritical: jest.fn()
}

describe('VaktMessagingManager', () => {
  const publisherId: string = 'publisherId'
  let vaktMessagingManager: IVaktMessagingManager
  let vaktMessagingFactoryManager: IVaktMessagingFactoryManager

  beforeEach(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)
    mockMessagingFactory.createRetryPublisher.mockImplementation(() => {
      return mockMessagePublisher
    })
    vaktMessagingManager = new VaktMessagingManager(mockMessagingFactory, publisherId)
    vaktMessagingFactoryManager = new VaktMessagingFactoryManager()
  })

  it('should send a notification message to vakt', async () => {
    const options: IHeadersType = {
      recipientStaticId: '1'
    }
    const message = vaktMessagingFactoryManager.getVaktMessage(LCMessageType.LCRequested, sampleLC, options)

    await vaktMessagingManager.notify(message)

    expect(mockMessagePublisher.publish).toHaveBeenCalled()
    expect(mockMessagePublisher.publish).toHaveBeenCalledWith('komgo-internal', message.payload, {
      recipientStaticId: message.headers.recipientStaticId,
      recipientPlatform: 'vakt'
    })
  })
})
