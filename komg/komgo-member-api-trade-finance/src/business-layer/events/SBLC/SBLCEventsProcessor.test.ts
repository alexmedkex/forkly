import 'reflect-metadata'

const mockDecodeReceivedEvent = jest.fn()

jest.mock('../../common/eventUtils', () => ({
  decodeReceivedEvent: mockDecodeReceivedEvent
}))

import { buildFakeStandByLetterOfCredit } from '@komgo/types'

import { ISBLCDataAgent } from '../../../data-layer/data-agents'

import { IEventsProcessor } from '../../common/IEventsProcessor'
import { IEvent } from '../../common/IEvent'

import { ISBLCEventService } from './ISBLCEventService'
import { SBLC_EVENT_TYPES } from './SBLCEvents'
import { SBLCEventsProcessor } from './SBLCEventsProcessor'

const sblcMockDataAgent: ISBLCDataAgent = {
  getByContractAddress: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
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

const sblcCreatedServiceMock: ISBLCEventService = {
  doEvent: jest.fn()
}

const nonceIncrementedServiceMock: ISBLCEventService = {
  doEvent: jest.fn()
}

const sblcTransitionServiceMock: ISBLCEventService = {
  doEvent: jest.fn()
}

const sblcDataUpdatedServiceMock: ISBLCEventService = {
  doEvent: jest.fn()
}

const sblcCreatedEvent = {
  name: SBLC_EVENT_TYPES.SBLCCreated
}

const sblcNonceIncrementedEvent = {
  name: SBLC_EVENT_TYPES.NonceIncremented
}

const sblcTransitionEvent = {
  name: SBLC_EVENT_TYPES.Transition
}

const sblcDataUpdatedEvent = {
  name: SBLC_EVENT_TYPES.DataUpdated
}

describe('SBLCEventsProcessor', () => {
  let sblcEventsProcessor: IEventsProcessor
  let logger
  let sampleSBLC

  beforeEach(() => {
    sampleSBLC = buildFakeStandByLetterOfCredit()
    sblcEventsProcessor = new SBLCEventsProcessor(
      sblcMockDataAgent,
      sblcCreatedServiceMock,
      nonceIncrementedServiceMock,
      sblcTransitionServiceMock,
      sblcDataUpdatedServiceMock
    )
    logger = (sblcEventsProcessor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  describe('doEvent', () => {
    it('should process the created event', async () => {
      mockDecodeReceivedEvent.mockImplementation(() => sblcCreatedEvent)

      sblcMockDataAgent.getByContractAddress = jest.fn().mockImplementation(() => sampleSBLC)
      await sblcEventsProcessor.processEvent(event)

      expect(logger.error).toHaveBeenCalledTimes(0)
      expect(logger.warn).toHaveBeenCalledTimes(0)
      expect(sblcCreatedServiceMock.doEvent).toHaveBeenCalledTimes(1)
      expect(sblcCreatedServiceMock.doEvent).toHaveBeenCalledWith(sampleSBLC, sblcCreatedEvent, event)
    })

    it('should process the nonce incremented event', async () => {
      mockDecodeReceivedEvent.mockImplementation(() => sblcNonceIncrementedEvent)

      sblcMockDataAgent.getByContractAddress = jest.fn().mockImplementation(() => sampleSBLC)
      await sblcEventsProcessor.processEvent(event)

      expect(logger.error).toHaveBeenCalledTimes(0)
      expect(logger.warn).toHaveBeenCalledTimes(0)
      expect(nonceIncrementedServiceMock.doEvent).toHaveBeenCalledTimes(1)
      expect(nonceIncrementedServiceMock.doEvent).toHaveBeenCalledWith(sampleSBLC, sblcNonceIncrementedEvent, event)
    })

    it('should process transition event', async () => {
      mockDecodeReceivedEvent.mockImplementation(() => sblcTransitionEvent)

      sblcMockDataAgent.getByContractAddress = jest.fn().mockImplementation(() => sampleSBLC)
      await sblcEventsProcessor.processEvent(event)

      expect(logger.error).toHaveBeenCalledTimes(0)
      expect(logger.warn).toHaveBeenCalledTimes(0)
      expect(sblcTransitionServiceMock.doEvent).toHaveBeenCalledTimes(1)
      expect(sblcTransitionServiceMock.doEvent).toHaveBeenCalledWith(sampleSBLC, sblcTransitionEvent, event)
    })

    it('should process data updated event', async () => {
      mockDecodeReceivedEvent.mockImplementation(() => sblcDataUpdatedEvent)

      sblcMockDataAgent.getByContractAddress = jest.fn().mockImplementation(() => sampleSBLC)
      await sblcEventsProcessor.processEvent(event)

      expect(logger.error).toHaveBeenCalledTimes(0)
      expect(logger.warn).toHaveBeenCalledTimes(0)
      expect(sblcDataUpdatedServiceMock.doEvent).toHaveBeenCalledTimes(1)
      expect(sblcDataUpdatedServiceMock.doEvent).toHaveBeenCalledWith(sampleSBLC, sblcDataUpdatedEvent, event)
    })

    it('test non decoded event', async () => {
      mockDecodeReceivedEvent.mockImplementation(() => {})

      await sblcEventsProcessor.processEvent(event)

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(sblcCreatedServiceMock.doEvent).toHaveBeenCalledTimes(0)
    })
  })
})
