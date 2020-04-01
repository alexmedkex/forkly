import 'reflect-metadata'

import { IEventsProcessor } from '../../business-layer/cache/IEventsProcessor'
import { IRegistryEventProcessedDataAgent } from '../../data-layer/data-agents/IRegistryEventProcessedDataAgent'

import IPollingServiceFactory from '../IPollingServiceFactory'

import { CacheEventService } from './CacheEventService'
import IService from './IService'
import createMockInstance from 'jest-create-mock-instance'
import { Web3Wrapper } from '@komgo/blockchain-access'

const createPollingMock = jest.fn<IService>().mockImplementation(() => asyncService)

const asyncService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

const mockPollingFactory: IPollingServiceFactory = {
  createPolling: createPollingMock
}

const registryEventProcessedDataAgent: IRegistryEventProcessedDataAgent = {
  createOrUpdate: jest.fn(),
  getLastEventProcessed: jest.fn()
}
const getMock = jest.fn()

const consumerMock = {
  get: getMock,
  close: jest.fn()
}

const messageFactoryMock = {
  createConsumer: jest.fn().mockImplementation(() => consumerMock)
}

const messageReceived = {
  ack: jest.fn(),
  nack: jest.fn(),
  content: {
    value: 'message',
    blockNumber: 2,
    transactionHash: '0x1',
    transactionIndex: 2,
    logIndex: 2
  },
  routingKey: 'rk',
  options: {
    messageId: 'message-id'
  }
}

const contractDeployed = { abi: [] }

const eventsProcessorMock: IEventsProcessor = {
  getDeployedContracts: jest.fn().mockImplementation(() => [contractDeployed]),
  processEventsBatch: jest.fn(),
  processEvent: jest.fn()
}

describe('CacheEventService test', () => {
  let cacheEventService: CacheEventService
  const mockWeb3Wrapper = createMockInstance(Web3Wrapper)
  beforeEach(() => {
    cacheEventService = new CacheEventService(
      messageFactoryMock,
      'consumer-id-test',
      'publisher-id-test',
      1000,
      eventsProcessorMock,
      registryEventProcessedDataAgent,
      mockPollingFactory,
      mockWeb3Wrapper
    )
    cacheEventService.events = {
      '0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82': {
        anonymous: false,
        name: 'NewOwner',
        type: 'event'
      }
    }
  })

  it('Test start duplicated - logIndex', async () => {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()
    const lastProcessedEvent = { blockNumber: 2, transactionIndex: 2, logIndex: 2 }
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => lastProcessedEvent)
    getMock.mockImplementation(() => messageReceived)
    await asyncFunction(endFunction)
    expect(eventsProcessorMock.processEvent).toHaveBeenCalledTimes(0)
    expect(messageReceived.ack).toHaveBeenCalledTimes(1)
  })

  it('Test start process event - higher blockNumber', async () => {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()
    const lastProcessedEvent = { blockNumber: 1, transactionIndex: 3, logIndex: 3 }
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => lastProcessedEvent)
    getMock.mockImplementation(() => messageReceived)
    await asyncFunction(endFunction)
    expect(eventsProcessorMock.processEvent).toHaveBeenCalledTimes(1)
    expect(messageReceived.ack).toHaveBeenCalledTimes(1)
  })

  it('Test start process event - higher txIndex', async () => {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()
    const lastProcessedEvent = { blockNumber: 2, transactionIndex: 1, logIndex: 3 }
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => lastProcessedEvent)
    getMock.mockImplementation(() => messageReceived)
    await asyncFunction(endFunction)
    expect(eventsProcessorMock.processEvent).toHaveBeenCalledTimes(1)
    expect(messageReceived.ack).toHaveBeenCalledTimes(1)
  })

  it('Test start process event - higher logIndex', async () => {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()
    const lastProcessedEvent = { blockNumber: 2, transactionIndex: 2, logIndex: 1 }
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => lastProcessedEvent)
    getMock.mockImplementation(() => messageReceived)
    await asyncFunction(endFunction)
    expect(eventsProcessorMock.processEvent).toHaveBeenCalledTimes(1)
    expect(messageReceived.ack).toHaveBeenCalledTimes(1)
  })

  it('Test stop', async () => {
    await cacheEventService.stop()
    expect(consumerMock.close).toHaveBeenCalledTimes(1)
  })

  it('Test start', async () => {
    mockWeb3Wrapper.buildEventsMapping.mockReturnValue({ sig: 'event' })
    await cacheEventService.start()
    expect(asyncService.start).toHaveBeenCalledTimes(1)
  })
})
