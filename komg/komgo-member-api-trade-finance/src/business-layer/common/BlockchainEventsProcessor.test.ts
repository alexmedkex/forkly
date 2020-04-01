import 'reflect-metadata'
import { IEventsProcessor } from './IEventsProcessor'

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

const message = {
  content: {
    data: '0xffff',
    blockNumber: 1,
    transactionHash: '0x1111111111111111111111111',
    contractAddress: '0x222222222222222222222222'
  },
  routingKey: 'BLK.0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd',
  ack: jest.fn(),
  options: {
    messageId: '1'
  }
}

const eventsProcessor: IEventsProcessor = {
  processEvent: jest.fn(),
  getEventMappings: jest.fn(() => ({
    '0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd': { name: 'event' }
  }))
}

import { BlockchainEventsProcessor } from './BlockchainEventsProcessor'
import { InvalidMessageException } from '../../exceptions'

describe('BlockchainEventsProcessor', () => {
  beforeEach(async () => {
    processor = new BlockchainEventsProcessor([eventsProcessor])

    await processor.getKeysToProcess()
  })

  it('should call eventsProcessor with the correct data', async () => {
    const expectedEvent = {
      data: message.content.data,
      topics: ['0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd'],
      blockNumber: message.content.blockNumber,
      transactionHash: message.content.transactionHash,
      address: message.content.contractAddress
    }
    await processor.processEvent(message)
    expect(eventsProcessor.processEvent).toHaveBeenCalledWith(expectedEvent)
  })

  it('should fail if unknown topic', async () => {
    const eventMessage = { routingKey: 'BLK.0000' }
    expect(processor.processEvent(eventMessage)).rejects.toThrow(InvalidMessageException)
  })
})
