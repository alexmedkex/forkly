import 'reflect-metadata'

import { AutoWhitelist } from '../models/auto-whitelist'

import { AutoWhitelistDataAgent } from './AutoWhitelistDataAgent'
import { StopBlockNumberAlreadySetError, DatabaseError } from './errors'

const findOneMock = jest.fn()
const updateOneMock = jest.fn()

describe('AutoWhitelistDataAgent', () => {
  let autoWhitelistDataAgent: AutoWhitelistDataAgent

  beforeAll(() => {
    AutoWhitelist.findOne = findOneMock
    AutoWhitelist.updateOne = updateOneMock
  })

  beforeEach(() => {
    autoWhitelistDataAgent = new AutoWhitelistDataAgent()
  })

  describe('getStartBlockNumber', () => {
    it('should get the current start block number saved in mongo', async () => {
      findOneMock.mockReturnValueOnce({ exec: () => ({ startBlockNumber: 10 }) })

      const n = await autoWhitelistDataAgent.getStartBlockNumber()

      expect(n).toBe(10)
      expect(AutoWhitelist.findOne).toHaveBeenCalledWith({})
    })

    it('should return 0 if there is no current block', async () => {
      findOneMock.mockReturnValueOnce({ exec: async () => null })

      const n = await autoWhitelistDataAgent.getStartBlockNumber()

      expect(n).toBe(0)
      expect(AutoWhitelist.findOne).toHaveBeenCalledWith({})
    })

    it('should reject if accessing the database fails', async () => {
      findOneMock.mockReturnValueOnce({
        exec: () => Promise.reject(new Error('msg'))
      })

      await expect(autoWhitelistDataAgent.getStartBlockNumber()).rejects.toThrow(DatabaseError)
    })
  })

  describe('getStopBlockNumber', () => {
    it('should get the current stop block number saved in mongo', async () => {
      findOneMock.mockReturnValueOnce({ exec: () => ({ stopBlockNumber: 10 }) })

      const n = await autoWhitelistDataAgent.getStopBlockNumber()

      expect(n).toBe(10)
      expect(AutoWhitelist.findOne).toHaveBeenCalledWith({})
    })

    it('should return null if there is no value set', async () => {
      findOneMock.mockReturnValueOnce({ exec: async () => null })

      const n = await autoWhitelistDataAgent.getStopBlockNumber()

      expect(n).toBe(null)
      expect(findOneMock).toHaveBeenCalledWith({})
    })

    it('should reject if accessing the database fails', async () => {
      findOneMock.mockReturnValueOnce({
        exec: () => Promise.reject(new Error('msg'))
      })

      await expect(autoWhitelistDataAgent.getStopBlockNumber()).rejects.toThrow(DatabaseError)
    })
  })

  describe('setStartBlockNumber', () => {
    it('should set the current start block number', async () => {
      updateOneMock.mockReturnValueOnce({ exec: async () => undefined })
      await autoWhitelistDataAgent.setStartBlockNumber(7)

      expect(updateOneMock).toHaveBeenCalledWith(
        {},
        {
          $set: { startBlockNumber: 7 }
        },
        { upsert: true }
      )
    })

    it('should reject if accessing the database fails', async () => {
      updateOneMock.mockReturnValueOnce({
        exec: () => Promise.reject(new Error('msg'))
      })

      await expect(autoWhitelistDataAgent.setStartBlockNumber(1)).rejects.toThrow(DatabaseError)
    })
  })

  describe('setStopBlockNumber', () => {
    it('should set the stop block number only if it doesnt exist', async () => {
      findOneMock.mockReturnValueOnce({ exec: () => Promise.resolve({ stopBlockNumber: null }) })
      updateOneMock.mockReturnValueOnce({ exec: () => Promise.resolve() })

      await autoWhitelistDataAgent.setStopBlockNumber(7)

      expect(AutoWhitelist.updateOne).toHaveBeenCalledWith(
        {},
        {
          $set: { stopBlockNumber: 7 }
        },
        { upsert: true }
      )
    })

    it('should throw if the stop block number exists', async () => {
      findOneMock.mockReturnValueOnce({ exec: () => Promise.resolve({ stopBlockNumber: 10 }) })

      await expect(autoWhitelistDataAgent.setStopBlockNumber(7)).rejects.toThrow(StopBlockNumberAlreadySetError)
    })

    it('should reject if accessing the database fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: () => Promise.resolve({ stopBlockNumber: null }) })
      updateOneMock.mockReturnValueOnce({
        exec: () => Promise.reject(new Error('msg'))
      })

      await expect(autoWhitelistDataAgent.setStopBlockNumber(1)).rejects.toThrow(DatabaseError)
    })
  })
})
