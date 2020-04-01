import 'reflect-metadata'
import { MessagePublishingService } from './MessagePublishingService'
import { MessagingFactory } from '@komgo/messaging-library'

const publishMethod = jest.fn()

const messagingFactoryMock = {
  createRetryPublisher: jest.fn(() => {
    return {
      publish: publishMethod
    }
  })
}

const service = new MessagePublishingService((messagingFactoryMock as unknown) as MessagingFactory, 'publisherId')

describe('publish', () => {
  let routingKey = 'routingKey'
  let content = {}
  let options = {}

  describe('success', () => {
    it('should publish a message', async () => {
      await service.publish(routingKey, content, options)
      expect(publishMethod).toHaveBeenCalledWith(routingKey, content, options)
    })
  })

  describe('failure', () => {
    beforeEach(() => {
      publishMethod.mockImplementation(async () => {
        throw new Error('fail')
      })
    })
    it('should throw an error', async () => {
      await expect(service.publish(routingKey, content, options)).rejects.toBeDefined()
    })
  })
})
