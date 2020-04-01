import 'reflect-metadata'
import { IMessageConsumer, MessagingFactory, IMessageReceived } from '@komgo/messaging-library'
// tslint:disable-next-line:no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import IPollingServiceFactory from '../../service-layer/IPollingServiceFactory'

let processor: MessageProcessor
let logger

const asyncService = {
  start: jest.fn(),
  stop: jest.fn()
}

const createPollingMock = jest.fn<IService>().mockImplementation(() => asyncService)

const mockPollingFactory: IPollingServiceFactory = {
  createPolling: createPollingMock
}

const listenMock = jest.fn()
let mockMessagingFactory: jest.Mocked<MessagingFactory>

const mockMessageConsumer: IMessageConsumer = {
  cancel: jest.fn(),
  close: jest.fn(),
  listen: listenMock,
  listenMultiple: jest.fn(),
  ackAll: jest.fn(),
  get: jest.fn(),
  isConnected: jest.fn()
}

const lcMessage = {
  content: {
    data: '0xffff',
    blockNumber: 1,
    transactionHash: '0x1111111111111111111111111',
    contractAddress: '0x222222222222222222222222'
  },
  routingKey: 'BLK.0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd',
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn(),
  options: {
    messageId: '1'
  }
}

const regularMessage = {
  content: {
    messageType: 'regular-message-key',
    property1: '1111',
    property2: '2222'
  },
  routingKey: 'regular-message-key',
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn(),
  options: {
    messageId: '1'
  }
}

const invalidMessage = {
  content: {
    messageType: 'invalid-message-key',
    property1: '1111',
    property2: '2222'
  },
  routingKey: 'invalid-message-key',
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn(),
  options: {
    messageId: '1'
  }
}

const errorMessage = {
  content: {
    messageType: 'error-message-key',
    property1: '1111',
    property2: '2222'
  },
  routingKey: 'error-message-key',
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn(),
  options: {
    messageId: '1'
  }
}

let lcEventsProcessor: IMessageEventProcessor
let eventsProcessor: IMessageEventProcessor
let eventsProcessorInvalidMessage: IMessageEventProcessor
let eventsProcessorError: IMessageEventProcessor

import { MessageProcessor } from './MessageProcessor'
import { IMessageEventProcessor } from './IMessageEventProcessor'
import { InvalidMessageException } from '../../exceptions'
import IService from '../IService'

const EVENT_MGNT_PUBLISHER_ID = 'publisherId'

describe('MessageProcessor', () => {
  beforeEach(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)
    mockMessagingFactory.createConsumer.mockImplementation(() => {
      return mockMessageConsumer
    })

    lcEventsProcessor = {
      processEvent: jest.fn(),
      getKeysToProcess: jest.fn().mockImplementation(() => {
        return ['BLK.0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd']
      })
    }

    eventsProcessor = {
      processEvent: jest.fn(),
      getKeysToProcess: jest.fn().mockImplementation(() => {
        return ['regular-message-key']
      })
    }

    eventsProcessorInvalidMessage = {
      processEvent: jest.fn().mockImplementation(() => {
        throw new InvalidMessageException('Invalid message')
      }),
      getKeysToProcess: jest.fn().mockImplementation(() => {
        return ['invalid-message-key']
      })
    }

    eventsProcessorError = {
      processEvent: jest.fn().mockImplementation(() => {
        throw new Error('Error')
      }),
      getKeysToProcess: jest.fn().mockImplementation(() => {
        return ['error-message-key']
      })
    }

    processor = new MessageProcessor(
      mockMessagingFactory,
      'consumer-id',
      EVENT_MGNT_PUBLISHER_ID,
      'trade-id',
      10,
      mockPollingFactory,
      [lcEventsProcessor, eventsProcessor, eventsProcessorInvalidMessage, eventsProcessorError]
    )

    logger = (processor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('should log an error if asyncPolling throws during start()', async () => {
    asyncService.start.mockImplementation(() => {
      throw new Error()
    })
    await processor.start()
  })

  it('should log an error if asyncPolling throws during stop()', async () => {
    asyncService.stop.mockImplementation(() => {
      throw new Error()
    })
    await processor.stop()
  })

  it('should log an error if reading events fails', async () => {
    mockMessageConsumer.get = jest.fn().mockImplementation(() => {
      throw new Error()
    })
    await processor.readAndConsumeEvents(EVENT_MGNT_PUBLISHER_ID)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })

  it('should call LCEventsProcessor with the correct data', async () => {
    mockMessageConsumer.get = jest.fn().mockImplementation(() => lcMessage)
    await processor.start()
    await processor.readAndConsumeEvents(EVENT_MGNT_PUBLISHER_ID)
    expect(lcEventsProcessor.processEvent).toHaveBeenCalledWith(lcMessage)
  })

  it('should call reguler EventsProcessor with the correct data', async () => {
    mockMessageConsumer.get = jest.fn().mockImplementation(() => regularMessage)
    await processor.start()
    await processor.readAndConsumeEvents(EVENT_MGNT_PUBLISHER_ID)
    expect(eventsProcessor.processEvent).toHaveBeenCalledWith(regularMessage)
    expect(regularMessage.ack).toBeCalled()
  })

  it('should call eventsProcessorError to call requeue message', async () => {
    mockMessageConsumer.get = jest.fn().mockImplementation(() => errorMessage)
    await processor.start()
    await processor.readAndConsumeEvents(EVENT_MGNT_PUBLISHER_ID)
    expect(eventsProcessorError.processEvent).toHaveBeenCalledWith(errorMessage)
    expect(errorMessage.requeue).toBeCalled()
    expect(logger.info).toBeCalled()
  })

  it('should call eventsProcessorInvalidMessage to call reject message', async () => {
    mockMessageConsumer.get = jest.fn().mockImplementation(() => invalidMessage)
    await processor.start()
    await processor.readAndConsumeEvents(EVENT_MGNT_PUBLISHER_ID)
    expect(eventsProcessorInvalidMessage.processEvent).toHaveBeenCalledWith(invalidMessage)
    expect(invalidMessage.reject).toBeCalled()
  })
})
