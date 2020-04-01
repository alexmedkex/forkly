import 'reflect-metadata'

import { IRegistryEventManagerDAO } from '../dao/IRegistryEventManagerDAO'

import { IRegistryEventProcessedDataAgent } from './IRegistryEventProcessedDataAgent'
import { RegistryEventProcessedDataAgent } from './RegistryEventProcessedDataAgent'

const eventManagerDaoMock: IRegistryEventManagerDAO = {
  createOrUpdate: jest.fn(),
  getLastEventProcessed: jest.fn()
}

const validLastEvent = {
  blockNumber: 123,
  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  transactionIndex: 0,
  logIndex: 2
}

describe('Test EventProcessedDataAgent', () => {
  let agent: IRegistryEventProcessedDataAgent

  beforeEach(() => {
    agent = new RegistryEventProcessedDataAgent(eventManagerDaoMock)
  })

  describe('Get last event processed', () => {
    it('get last event success', async () => {
      eventManagerDaoMock.getLastEventProcessed.mockImplementation(() => validLastEvent)
      const lastEvent = await agent.getLastEventProcessed()
      expect(lastEvent).toEqual(validLastEvent)
    })

    it('get last event fails exception thrown', async () => {
      eventManagerDaoMock.getLastEventProcessed.mockImplementation(() => {
        throw new Error()
      })
      const result = agent.getLastEventProcessed()
      await result.catch(error => {
        expect(error).toBeDefined()
      })
    })
  })

  describe('Save event processed', () => {
    it('save event processed success', async () => {
      await agent.createOrUpdate(validLastEvent.blockNumber, validLastEvent.transactionIndex, validLastEvent.logIndex)
      expect(eventManagerDaoMock.createOrUpdate).toHaveBeenCalledTimes(1)
    })

    it('save event fails exception thrown', async () => {
      eventManagerDaoMock.createOrUpdate.mockImplementation(() => {
        throw new Error()
      })
      const result = agent.createOrUpdate(
        validLastEvent.blockNumber,
        validLastEvent.transactionIndex,
        validLastEvent.logIndex
      )
      await result.catch(error => {
        expect(error).toBeDefined()
      })
    })
  })
})
