import { IDocumentProcessor } from './IDocumentProcessor'
import { DocumentMessageType } from '../messaging/messageTypes'
import 'reflect-metadata'

jest.mock('@komgo/blockchain-access', () => {
  return {
    buildEventsMapping: jest.fn(() => {
      return {
        '0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd': {
          name: 'event'
        }
      }
    })
  }
})

let processor
let logger

const messageData: IDocumentEventData = {
  messageType: DocumentMessageType.VaktDocument,
  vaktId: 'test-vakt-id',
  parcelId: 'test-parcel-id',
  lcId: 'LC-ID',
  filename: 'test.txt',
  contents: 'MTIzNGRa',
  documentType: 'Q88'
}
const message = {
  content: messageData,
  routingKey: DocumentMessageType.VaktDocument,
  ack: jest.fn(),
  options: {
    messageId: '1'
  }
}

const eventsProcessor: IDocumentProcessor = {
  processEvent: jest.fn()
}

const discardDocProcessor: IDocumentProcessor = {
  processEvent: jest.fn()
}

import { DocumentEventProcessor } from './DocumentEventProcessor'
import { IDocumentEventData } from './IDocumentEventData'

describe('DocumentEventProcessor', () => {
  beforeEach(async () => {
    processor = new DocumentEventProcessor(eventsProcessor, discardDocProcessor)
    logger = (processor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
    await processor.getKeysToProcess()
  })

  it('should call eventsProcessor with the correct data', async () => {
    await processor.processEvent(message)
    expect(eventsProcessor.processEvent).toHaveBeenCalledWith(messageData)
  })

  it('should log error when processing throw error', async () => {
    const error = new Error('DocumentEventProcessor: process event failed')
    eventsProcessor.processEvent = jest.fn().mockImplementation(() => {
      throw error
    })
    await expect(processor.processEvent(message)).rejects.toThrow(error)
  })

  it('it should skip processing message with wrong messageType', async () => {
    const wrongMessage = {
      content: {
        ...messageData,
        messageType: 'wrong-message-key'
      },
      routingKey: 'wrong-message-key',
      ack: jest.fn(),
      options: {
        messageId: '1'
      }
    }
    await processor.processEvent(wrongMessage)
    expect(eventsProcessor.processEvent).not.toHaveBeenCalled()
  })
})
