import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { buildFakeLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { IMessageReceived } from '@komgo/messaging-library'

import { IMessageEventProcessor } from '../../message-processing/IMessageEventProcessor'

import { MessageType, ILetterOfCreditMessagePayload } from '../messaging/ILetterOfCreditMessageType'
import { LetterOfCreditMessageProcessor } from './LetterOfCreditMessageProcessor'
import { ILetterOfCreditReceivedService } from '../services/ILetterOfCreditReceivedService'
import { LetterOfCreditReceivedService } from '../services/LetterOfCreditReceivedService'

describe('LetterOfCreditMessageProcessor', () => {
  let sampleLetterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let mockMessagePayload: ILetterOfCreditMessagePayload
  let mockMessageReceived: IMessageReceived
  let letterOfCreditProcessor: IMessageEventProcessor
  let letterOfCreditDataProcessor: jest.Mocked<ILetterOfCreditReceivedService>

  beforeEach(() => {
    sampleLetterOfCredit = buildFakeLetterOfCredit()
    mockMessagePayload = { ...sampleLetterOfCredit, messageType: MessageType.LetterOfCredit }
    mockMessageReceived = {
      content: mockMessagePayload,
      routingKey: 'komgo-internal',
      options: {},
      ack: jest.fn(),
      reject: jest.fn(),
      requeue: jest.fn()
    }
    letterOfCreditDataProcessor = createMockInstance(LetterOfCreditReceivedService)
  })

  describe('processEvent', () => {
    beforeEach(() => {
      letterOfCreditProcessor = new LetterOfCreditMessageProcessor(letterOfCreditDataProcessor)
    })

    it('should call letterOfCreditDataProcessor', async () => {
      const mockMessage = mockMessageReceived

      await letterOfCreditProcessor.processEvent(mockMessage)

      expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalled()
      expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalledTimes(1)
      expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalledWith(mockMessage.content)
    })

    it('should not call the letterOfCreditDataProcessor due to a wrong message type', async () => {
      const contentWithWrongType = { ...mockMessagePayload, messageType: 'Invalid' }
      const mockMessageReceivedWithWrongType = { ...mockMessageReceived, content: contentWithWrongType }

      try {
        await letterOfCreditProcessor.processEvent(mockMessageReceivedWithWrongType)
      } catch (error) {
        expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalledTimes(0)
        expect(error).toEqual(new Error('undefined message processor'))
      }
    })

    it('should throw an error when the message processor is not set', async () => {
      const mockMessage = mockMessageReceived

      letterOfCreditProcessor = new LetterOfCreditMessageProcessor(undefined)

      try {
        await letterOfCreditProcessor.processEvent(mockMessage)
      } catch (error) {
        expect(error).toEqual(new Error('undefined message processor'))
        expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalledTimes(0)
      }
    })

    it('should throw an error when the letterOfCreditDataProcessor fails', async () => {
      const mockMessage = mockMessageReceived

      letterOfCreditDataProcessor.processEvent.mockImplementation(() => {
        throw new Error('issue in processEvent')
      })
      try {
        await letterOfCreditProcessor.processEvent(mockMessage)
      } catch (error) {
        expect(error).toEqual(new Error('issue in processEvent'))
        expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalledTimes(1)
        expect(letterOfCreditDataProcessor.processEvent).toHaveBeenCalledWith(mockMessage.content)
      }
    })
  })

  describe('getKeysToProcess', () => {
    beforeEach(() => {
      letterOfCreditProcessor = new LetterOfCreditMessageProcessor(letterOfCreditDataProcessor)
    })

    it('should get the keys of the events correctly', async () => {
      const result = await letterOfCreditProcessor.getKeysToProcess()

      expect(result).toEqual(['KOMGO.LetterOfCredit'])
    })
  })
})
