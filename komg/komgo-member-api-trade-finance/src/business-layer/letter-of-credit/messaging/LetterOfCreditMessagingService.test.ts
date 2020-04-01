import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { MessagingFactory } from '@komgo/messaging-library'
import { buildFakeLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

import { IMessagePublishingService } from '../../message-processing/IMessagePublishingService'

import { LetterOfCreditMessagingService } from './LetterOfCreditMessagingService'
import { ILetterOfCreditMessagingService } from './ILetterOfCreditMessagingService'
import { MessageType } from './ILetterOfCreditMessageType'

const mockPublishFunction = jest.fn()

const mockMessagePublisher: IMessagePublishingService = {
  publish: mockPublishFunction
}

describe('LetterOfCreditMessagingService', () => {
  let mockMessagingFactory: jest.Mocked<MessagingFactory>
  let letterOfCreditMessagingServiceInstance: ILetterOfCreditMessagingService

  beforeAll(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)
    mockMessagingFactory.createRetryPublisher.mockImplementation(() => {
      return mockMessagePublisher
    })
    letterOfCreditMessagingServiceInstance = new LetterOfCreditMessagingService(mockMessagePublisher)
  })

  describe('sendMessageTo', () => {
    it('should send the message to rabbitMQ', async () => {
      const fakeLetterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit()
      const { beneficiary } = fakeLetterOfCredit.templateInstance.data
      const beneficiaryStaticId = beneficiary.staticId
      const expectedPayload = { ...fakeLetterOfCredit, messageType: MessageType.LetterOfCredit }

      mockPublishFunction.mockImplementation(() =>
        Promise.resolve({
          messageId: '123'
        })
      )

      const result = await letterOfCreditMessagingServiceInstance.sendMessageTo(beneficiaryStaticId, fakeLetterOfCredit)

      expect(mockMessagePublisher.publish).toHaveBeenCalled()
      expect(mockMessagePublisher.publish).toHaveBeenCalledWith('komgo-internal', expectedPayload, {
        recipientStaticId: beneficiaryStaticId
      })
      expect(result).toBeDefined()
      expect(result).toEqual('123')
    })

    it('should fail when sending a message to rabbitMQ', async () => {
      const fakeLetterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit()
      const { beneficiary } = fakeLetterOfCredit.templateInstance.data
      const beneficiaryStaticId = beneficiary.staticId
      const expectedPayload = { ...fakeLetterOfCredit, messageType: MessageType.LetterOfCredit }

      mockPublishFunction.mockImplementation(() => {
        throw new Error('RabbitMQ Error')
      })

      const sendMessageToCall = letterOfCreditMessagingServiceInstance.sendMessageTo(
        beneficiaryStaticId,
        fakeLetterOfCredit
      )

      expect(mockMessagePublisher.publish).toHaveBeenCalled()
      expect(mockMessagePublisher.publish).toHaveBeenCalledWith('komgo-internal', expectedPayload, {
        recipientStaticId: beneficiaryStaticId
      })
      await expect(sendMessageToCall).rejects.toEqual(new Error('Failed to publish letter of credit message'))
    })
  })
})
