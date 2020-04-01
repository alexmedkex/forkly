import { IEventsProcessor } from '../../common/IEventsProcessor'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILCEventService } from './ILCEventService'
import 'reflect-metadata'

const mockDecodeReceivedEvent = jest.fn()

jest.mock('../../common/eventUtils', () => ({
  decodeReceivedEvent: mockDecodeReceivedEvent
}))

import { LCEventsProcessor } from './LCEventsProcessor'
import { IEvent } from '../../common/IEvent'

const cacheMock: ILCCacheDataAgent = {
  getLC: jest.fn(),
  saveLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  getLCs: jest.fn(),
  updateLcByReference: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

const event: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const lcCreatedService: ILCEventService = {
  doEvent: jest.fn()
}

const lCTransitionProcessor: ILCEventService = {
  doEvent: jest.fn()
}

const eventDecodedLcCreated = {
  name: 'LCCreated'
}

const eventDecodedUnknown = {
  name: 'Unknown'
}

const emptyObj = {}

describe('LCEventsProcessor', () => {
  let eventsProcessor: IEventsProcessor
  let logger
  beforeEach(() => {
    eventsProcessor = new LCEventsProcessor(cacheMock, lcCreatedService, lCTransitionProcessor, null, null)
    logger = (eventsProcessor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('test non decoded event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => emptyObj)
    cacheMock.getLC = jest.fn().mockImplementation(() => undefined)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test unknown event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventDecodedUnknown)
    cacheMock.getLC = jest.fn().mockImplementation(() => undefined)
    await eventsProcessor.processEvent(event)
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test unknown event name', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventDecodedUnknown)
    cacheMock.getLC = jest.fn().mockImplementation(() => emptyObj)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test LCCreated event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventDecodedLcCreated)
    cacheMock.getLC = jest.fn().mockImplementation(() => undefined)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(1)
  })
})
