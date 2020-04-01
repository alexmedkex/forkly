import 'reflect-metadata'

import { IEventsProcessor } from '../../common/IEventsProcessor'
import { ILCAmendmentDataAgent } from '../../../data-layer/data-agents'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'

const mockDecodeReceivedEvent = jest.fn()

jest.mock('../../common/eventUtils', () => ({
  decodeReceivedEvent: mockDecodeReceivedEvent
}))

import { LCAmendmentEventsProcessor } from './LCAmendmentEventsProcessor'
import { IEvent } from '../../common/IEvent'
import { LC_AMENDMENT_EVENT_TYPES } from './LCAmendmentEvents'
import { buildFakeAmendment } from '@komgo/types'

const emptyObj = {}

const amendmentDataAgent: ILCAmendmentDataAgent = {
  count: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  getByAddress: jest.fn()
}

const event: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const amendmentCreatedService: ILCAmendmentEventService = {
  doEvent: jest.fn()
}

const amendmentTransitionService: ILCAmendmentEventService = {
  doEvent: jest.fn()
}

const amendmentDataUpdatedService: ILCAmendmentEventService = {
  doEvent: jest.fn()
}

const eventLCAmendmentCreated = {
  name: LC_AMENDMENT_EVENT_TYPES.LCAmendmentCreated
}

const eventLCAmendmentTransition = {
  name: LC_AMENDMENT_EVENT_TYPES.Transition
}

const eventLCAmendmentDataUpdated = {
  name: LC_AMENDMENT_EVENT_TYPES.DataUpdated
}

describe('LCAmendmentEventsProcessor', () => {
  let eventsProcessor: IEventsProcessor
  let logger
  beforeEach(() => {
    eventsProcessor = new LCAmendmentEventsProcessor(
      amendmentDataAgent,
      amendmentCreatedService,
      amendmentTransitionService,
      amendmentDataUpdatedService
    )
    logger = (eventsProcessor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('test non decoded event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => emptyObj)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(amendmentCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test LCAmendmentCreated event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventLCAmendmentCreated)
    await eventsProcessor.processEvent(event)
    expect(logger.warn).toHaveBeenCalledTimes(0)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(amendmentCreatedService.doEvent).toHaveBeenCalledTimes(1)
  })

  it('test Transition event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventLCAmendmentTransition)
    amendmentDataAgent.getByAddress = jest.fn().mockImplementationOnce(() => buildFakeAmendment())
    await eventsProcessor.processEvent(event)
    expect(logger.warn).toHaveBeenCalledTimes(0)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(amendmentTransitionService.doEvent).toHaveBeenCalledTimes(1)
  })

  it('test DataUpdated event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventLCAmendmentDataUpdated)
    amendmentDataAgent.getByAddress = jest.fn().mockImplementationOnce(() => buildFakeAmendment())
    await eventsProcessor.processEvent(event)
    expect(logger.warn).toHaveBeenCalledTimes(0)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(amendmentTransitionService.doEvent).toHaveBeenCalledTimes(0)
    expect(amendmentDataUpdatedService.doEvent).toHaveBeenCalledTimes(1)
  })
})
