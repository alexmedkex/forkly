import 'reflect-metadata'

import { EventProcessed } from '../models/events'

import { DatabaseError } from './errors'
import { EventProcessedDataAgent } from './EventProcessedDataAgent'

const validLastEvent = {
  blockNumber: 123,
  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  logIndex: 2
}

const findOneMock = jest.fn()
const findOneAndUpdateMock = jest.fn()

describe('EventProcessedDataAgent', () => {
  let agent: EventProcessedDataAgent

  beforeAll(() => {
    EventProcessed.findOne = findOneMock
    EventProcessed.findOneAndUpdate = findOneAndUpdateMock
  })

  beforeEach(() => {
    agent = new EventProcessedDataAgent()
  })

  describe('Get last event processed', () => {
    it('get last event success', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(validLastEvent) })

      const lastEvent = await agent.getLastEventProcessed()

      expect(findOneMock).toHaveBeenCalledTimes(1)
      expect(findOneMock).toHaveBeenCalledWith({})
      expect(lastEvent).toEqual(validLastEvent)
    })

    it('get last event fails exception thrown', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      const result = agent.getLastEventProcessed()
      await expect(result).rejects.toThrowError(DatabaseError)
    })
  })

  describe('Save event processed', () => {
    it('save event processed success', async () => {
      findOneAndUpdateMock.mockReturnValueOnce({ exec: async () => undefined })

      await agent.saveEventProcessed(
        validLastEvent.blockNumber,
        validLastEvent.transactionHash,
        validLastEvent.logIndex
      )
      expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1)
      expect(findOneAndUpdateMock).toHaveBeenCalledWith({}, { $set: validLastEvent }, { upsert: true })
    })

    it('save event fails exception thrown', async () => {
      findOneAndUpdateMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      const result = agent.saveEventProcessed(
        validLastEvent.blockNumber,
        validLastEvent.transactionHash,
        validLastEvent.logIndex
      )
      await expect(result).rejects.toThrow(DatabaseError)
    })
  })
})
