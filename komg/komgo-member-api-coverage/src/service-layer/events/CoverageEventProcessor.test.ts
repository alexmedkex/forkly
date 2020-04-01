import 'reflect-metadata'

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  metric: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import { ConsumerWatchdog } from '@komgo/messaging-library'
import { CoverageEventProcessor } from './CoverageEventProcessor'
import IEventsProcessor from '../../business-layer/messaging/event/IEventsProcessor'
import { ConsumerWatchdogFactory } from '../../business-layer/messaging/ConsumerWatchdogFactory'
import { mock } from '../../mock-utils'

let eventService: CoverageEventProcessor
const watchdogFactory = mock(ConsumerWatchdogFactory)
const consumerWatchdog = mock(ConsumerWatchdog)

const PUBLISHER_ID = 'publisher-id'

const eventsProcessor: jest.Mocked<IEventsProcessor> = {
  processEvent: jest.fn()
}

const getMessage = messageData => {
  return {
    ack: jest.fn(),
    reject: jest.fn(),
    content: messageData,
    options: {
      messageId: '',
      recipientDomainID: '',
      senderDomainID: ''
    },
    routingKey: ''
  }
}

describe('CoverageEventProcessor', () => {
  beforeEach(() => {
    consumerWatchdog.close.mockClear()
    watchdogFactory.create.mockClear()
    watchdogFactory.create.mockReturnValue(consumerWatchdog)

    eventService = new CoverageEventProcessor(watchdogFactory, eventsProcessor, PUBLISHER_ID)
    expect(watchdogFactory.create).toBeCalled()
  })

  describe('.start', () => {
    // it('aaaa', () => {
    //   const x = new CoverageEventProcessor(null, null, null)
    // })

    it('start', async () => {
      await eventService.start()
      expect(loggerMock.info).toHaveBeenCalledWith('CoverageEventProcessor Service started')
      expect(consumerWatchdog.listenMultiple).toHaveBeenCalled()
    })
  })

  describe('.stop', () => {
    it('stop', async () => {
      await eventService.start()
      await eventService.stop()
      expect(loggerMock.info).toHaveBeenCalledWith('CoverageEventProcessor Service stopped')
      expect(consumerWatchdog.close).toHaveBeenCalledTimes(1)
    })

    it('stop', async () => {
      consumerWatchdog.close.mockImplementation(() => {
        throw new Error('test:error')
      })

      await eventService.start()
      await eventService.stop()
      expect(loggerMock.info).toHaveBeenCalledWith('CoverageEventProcessor Service stopped')
      expect(consumerWatchdog.close).toHaveBeenCalledTimes(1)
      expect(loggerMock.error).toBeCalled()
    })
  })

  describe('consume message', () => {
    it('processes message', async () => {
      await eventService.start()

      const handleIncomingMessage = consumerWatchdog.listenMultiple.mock.calls[0][2].bind(eventService)
      const message = getMessage({})

      await handleIncomingMessage(message)

      expect(eventsProcessor.processEvent).toHaveBeenCalled()
      expect(message.ack).toHaveBeenCalled()
    })

    it('handle processing error', async () => {
      await eventService.start()
      eventsProcessor.processEvent.mockImplementation(() => {
        throw new Error('Some Error')
      })

      const handleIncomingMessage = consumerWatchdog.listenMultiple.mock.calls[0][2].bind(eventService)
      const message = getMessage({})

      await handleIncomingMessage(message)

      expect(eventsProcessor.processEvent).toHaveBeenCalled()
      expect(message.reject).toHaveBeenCalled()
      expect(loggerMock.error).toHaveBeenCalled()
    })
  })
})
