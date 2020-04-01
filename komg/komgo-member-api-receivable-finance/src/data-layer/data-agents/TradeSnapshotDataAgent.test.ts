import { ITradeSnapshot } from '@komgo/types'

import { DataLayerError } from '../errors'
import { TradeSnapshotModel } from '../models/trade-snapshot/TradeSnapshotModel'

import { TradeSnapshotDataAgent } from './TradeSnapshotDataAgent'

const updateOneMock = jest.fn()
const findMock = jest.fn()
const createMock = jest.fn()

describe('TradeSnapshotDataAgent', () => {
  let dataAgent: TradeSnapshotDataAgent
  let mockTradeSnapshot: ITradeSnapshot
  let mockTradeSnapshotDocument: any

  beforeAll(() => {
    TradeSnapshotModel.updateOne = updateOneMock
    TradeSnapshotModel.find = findMock
    TradeSnapshotModel.create = createMock
  })

  beforeEach(() => {
    dataAgent = new TradeSnapshotDataAgent()
    mockTradeSnapshot = { source: 'KOMGO', sourceId: 'sourceId', trade: {} as any, movements: [] }
    mockTradeSnapshotDocument = {
      toObject: () => mockTradeSnapshot
    }
  })

  describe('updateCreate', () => {
    it('saves object without timestamps if createdAt is present', async () => {
      updateOneMock.mockReturnValueOnce({ exec: async () => null })
      mockTradeSnapshot.createdAt = new Date().toJSON()

      await dataAgent.updateCreate(mockTradeSnapshot)

      expect(updateOneMock).toHaveBeenCalledWith(
        {
          source: mockTradeSnapshot.source,
          sourceId: mockTradeSnapshot.sourceId,
          createdAt: mockTradeSnapshot.createdAt
        },
        mockTradeSnapshot,
        { upsert: true, timestamps: false }
      )
    })

    it('saves object with right parameters', async () => {
      updateOneMock.mockReturnValueOnce({ exec: async () => null })
      const { createdAt: _, ...mockTradeSnapshotWithoutTimestamp } = mockTradeSnapshot

      await dataAgent.updateCreate(mockTradeSnapshotWithoutTimestamp)

      expect(updateOneMock).toHaveBeenCalledWith(
        {
          source: mockTradeSnapshot.source,
          sourceId: mockTradeSnapshot.sourceId,
          createdAt: undefined
        },
        mockTradeSnapshot,
        { upsert: true, timestamps: true }
      )
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      updateOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(dataAgent.updateCreate(mockTradeSnapshot)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByTradeSourceId', () => {
    it('should return a trade snapshot successfully', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([mockTradeSnapshotDocument]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }
      findMock.mockReturnValueOnce(limitMock)

      const savedData = await dataAgent.findByTradeSourceId('tradeSourceId')

      expect(savedData).toEqual(mockTradeSnapshot)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      const execMock = { exec: jest.fn().mockRejectedValueOnce(new Error()) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }
      findMock.mockReturnValueOnce(limitMock)

      await expect(dataAgent.findByTradeSourceId('tradeSourceId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('update', () => {
    it('should add a new updated trade snapshot successfully', async () => {
      createMock.mockReturnValueOnce(mockTradeSnapshotDocument)

      const savedData = await dataAgent.update(mockTradeSnapshot)

      expect(savedData).toEqual(mockTradeSnapshot)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockRejectedValueOnce(new Error())

      await expect(dataAgent.update(mockTradeSnapshot)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findAllByStaticId', () => {
    it('should return all trade snapshots data for the given sourceId', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([mockTradeSnapshotDocument, mockTradeSnapshotDocument]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }

      findMock.mockReturnValueOnce(sortMock)

      const savedData = await dataAgent.findAllBySourceId('sourceId')
      expect(savedData).toEqual([mockTradeSnapshot, mockTradeSnapshot])
    })

    it('should return an empty array if no trade snapshots are found for the given sourceId', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }

      findMock.mockReturnValueOnce(sortMock)

      const savedData = await dataAgent.findAllBySourceId('sourceId')
      expect(savedData).toEqual([])
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findMock.mockReturnValueOnce({ limit: jest.fn().mockReturnValue(new Error()) })

      await expect(dataAgent.findAllBySourceId('sourceId')).rejects.toThrowError(DataLayerError)
    })
  })
})
