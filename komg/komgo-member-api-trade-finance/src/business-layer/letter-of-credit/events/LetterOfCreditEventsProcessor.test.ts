import 'reflect-metadata'

import { IEventsProcessor } from '../../common/IEventsProcessor'
import { ILetterOfCreditEventService } from '../services/ILetterOfCreditEventService'

const mockDecodeReceivedEvent = jest.fn()

jest.mock('../../common/eventUtils', () => ({
  decodeReceivedEvent: mockDecodeReceivedEvent
}))

import { LetterOfCreditEventsProcessor } from './LetterOfCreditEventsProcessor'
import { IEvent } from '../../common/IEvent'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents/letter-of-credit/ILetterOfCreditDataAgent'

const agentMock: ILetterOfCreditDataAgent = {
  get: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn(),
  getByContractAddress: jest.fn(),
  find: jest.fn(),
  getByTransactionHash: jest.fn()
}

const event: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const lcCreatedService: ILetterOfCreditEventService = {
  doEvent: jest.fn()
}

const mockNonceIncrementedService: ILetterOfCreditEventService = {
  doEvent: jest.fn()
}

const mockTransitionService: ILetterOfCreditEventService = {
  doEvent: jest.fn()
}
const eventDecodedLetterOfCreditCreated = {
  name: 'LetterOfCreditCreated'
}

const eventDecodedUnknown = {
  name: 'Unknown'
}

const emptyObj = {}

describe('LCEventsProcessor', () => {
  let eventsProcessor: IEventsProcessor
  let logger
  beforeEach(() => {
    eventsProcessor = new LetterOfCreditEventsProcessor(
      agentMock,
      lcCreatedService,
      mockNonceIncrementedService,
      mockTransitionService
    )
    logger = (eventsProcessor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('test non decoded event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => emptyObj)
    agentMock.get = jest.fn().mockImplementation(() => undefined)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test unknown event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventDecodedUnknown)
    agentMock.get = jest.fn().mockImplementation(() => undefined)
    await eventsProcessor.processEvent(event)
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test unknown event name', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventDecodedUnknown)
    agentMock.getByContractAddress = jest.fn().mockImplementation(() => emptyObj)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('test LetterOfCreditCreated event', async () => {
    mockDecodeReceivedEvent.mockImplementation(() => eventDecodedLetterOfCreditCreated)
    agentMock.get = jest.fn().mockImplementation(() => undefined)
    await eventsProcessor.processEvent(event)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(lcCreatedService.doEvent).toHaveBeenCalledTimes(1)
  })

  // TODO TESTS FOR NonceIncrementedService and TransitionService...
})
