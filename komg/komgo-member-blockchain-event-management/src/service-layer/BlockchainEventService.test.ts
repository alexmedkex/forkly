import MessagingFactory from '@komgo/messaging-library/dist/MessagingFactory'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import EventValidator from '../business-layer/events-validation/EventValidator'
import { EventProcessedDataAgent } from '../data-layer/data-agents/EventProcessedDataAgent'

import BlockchainEventService from './BlockchainEventService'

const asyncService = {
  start: jest.fn(),
  stop: jest.fn()
}
const createPollingMock = jest.fn(() => asyncService)
const mockPollingFactory = {
  createPolling: createPollingMock
}

const lastEventMock = {
  blockNumber: 1234,
  logIndex: 0,
  transactionHash: 'hash0'
}

const lastEventMock0 = { blockNumber: 0, transactionHash: '', logIndex: 0 }

const publisherMock = {
  register: jest.fn(),
  close: jest.fn(),
  publish: jest.fn()
}

const maxRequestsPerSecond = 10

const eth = {
  getBlock: jest.fn(),
  getBlockNumber: jest.fn(),
  getTransactionReceipt: jest.fn()
}

const mockWeb3 = {
  eth
}

describe('BlockchainEventService', () => {
  let eventListener: BlockchainEventService
  let eventValidatorMock: jest.Mocked<EventValidator>
  let mockMessagingFactory: jest.Mocked<MessagingFactory>
  let dataAgent: jest.Mocked<EventProcessedDataAgent>

  beforeEach(() => {
    eventValidatorMock = createMockInstance(EventValidator)
    mockMessagingFactory = createMockInstance(MessagingFactory)
    dataAgent = createMockInstance(EventProcessedDataAgent)

    // Default return values
    eventValidatorMock.validate.mockResolvedValue(true)
    mockMessagingFactory.createRetryPublisher.mockReturnValue(publisherMock)

    eventListener = new BlockchainEventService(
      mockWeb3 as any,
      dataAgent,
      eventValidatorMock,
      mockMessagingFactory,
      mockPollingFactory,
      'mq-id',
      1000,
      maxRequestsPerSecond
    )
  })

  describe('Test events processing', () => {
    it('Starts polling when started', async () => {
      await eventListener.start()
      expect(asyncService.start).toHaveBeenCalledTimes(1)
    })

    it('Create document when starts and there is nothing in DB', async () => {
      dataAgent.getLastEventProcessed.mockImplementation(() => undefined)
      await eventListener.start()
      expect(asyncService.start).toHaveBeenCalledTimes(1)
      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(1)
    })

    it('Stops polling when stopped', async () => {
      await eventListener.stop()
      expect(publisherMock.close).toHaveBeenCalledTimes(1)
      expect(asyncService.stop).toHaveBeenCalledTimes(1)
    })

    it('should process the first block successfully', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 1
      const nbEventsPerTransaction = 2
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      await asyncFunction(endFunction)

      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(nbEventsPerTransaction * nbTxs)
    })

    it('should process an already seen block with 1 processed event successfully', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 1
      const nbEventsPerTransaction = 2
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => lastEventMock.blockNumber)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock)
      await asyncFunction(endFunction)

      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(nbEventsPerTransaction * nbTxs - 1)
    })

    it('should process a block with multiple transactions successfully', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 5
      const nbEventsPerTransaction = 2
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      await asyncFunction(endFunction)

      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(nbEventsPerTransaction * nbTxs)
    })

    it('should process multiple blocks with multiple transactions successfully', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbBlocks = 2
      const nbTxs = 2
      const nbEventsPerTransaction = 2
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => nbBlocks)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      await asyncFunction(endFunction)

      // nbBlocks + 1 because we start at block 0
      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes((nbBlocks + 1) * nbEventsPerTransaction * nbTxs)
    })

    it('should process a block with no events successfully', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 2
      const nbEventsPerTransaction = 0
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      await asyncFunction(endFunction)

      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(nbTxs)
    })

    it('should process a block with no transactions successfully', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 0
      const nbEventsPerTransaction = 0
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      await asyncFunction(endFunction)

      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(1)
    })

    it('should do nothing if we get an undefined last processed event', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()
      const nbTxs = 0
      const nbEventsPerTransaction = 0
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => undefined)
      await asyncFunction(endFunction)

      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(0)
    })

    it('should not save events if there is a connection error when publishing the message', async () => {
      publisherMock.publish.mockImplementationOnce(() => {
        throw new Error()
      })
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 1
      const nbEventsPerTransaction = 1
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      await asyncFunction(endFunction)

      expect(publisherMock.publish).toHaveBeenCalledTimes(1)
      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(0)
    })

    it('should not publish events from transactions coming from a blacklisted contract', async () => {
      const asyncFunction = createPollingMock.mock.calls[0][0]
      const endFunction = jest.fn()

      const nbTxs = 1
      const nbEventsPerTransaction = 1
      mockBlock(nbTxs, nbEventsPerTransaction)
      eth.getBlockNumber.mockImplementation(() => 0)
      dataAgent.getLastEventProcessed.mockImplementation(() => lastEventMock0)
      eventValidatorMock.validate.mockResolvedValueOnce(false)
      await asyncFunction(endFunction)

      expect(publisherMock.publish).toHaveBeenCalledTimes(0)
      expect(dataAgent.saveEventProcessed).toHaveBeenCalledTimes(1)
    })
  })

  function mockBlock(nbTxs: number, nbEventsPerTransaction: number) {
    const transactionHashes = []
    for (let i = 0; i < nbTxs; i++) {
      transactionHashes.push('hash' + i)
    }

    const block = {
      transactions: transactionHashes
    }
    eth.getBlock.mockImplementation(() => block)

    const logs = []
    for (let i = 0; i < nbEventsPerTransaction; i++) {
      logs.push({ topics: ['0xtopic' + i] })
    }
    const transactionReceipt = {
      logs
    }
    eth.getTransactionReceipt.mockImplementation(() => transactionReceipt)
  }
})
