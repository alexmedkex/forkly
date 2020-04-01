import { buildFakeReceivablesDiscountingBase, buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import 'reflect-metadata'

import { EntityNotFoundError } from '../../business-layer/errors'
import { DataLayerError } from '../errors'
import { ReceivablesDiscountingModel } from '../models/receivables-discounting/ReceivablesDiscountingModel'

import { ReceivablesDiscountingDataAgent } from './ReceivablesDiscountingDataAgent'

const createMock = jest.fn()
const updateOneMock = jest.fn()
const findOneAndUpdateMock = jest.fn()
const aggregateMock = jest.fn()
const findOneMock = jest.fn()
const findMock = jest.fn()

const rdBase = buildFakeReceivablesDiscountingBase()
const rdExtended = buildFakeReceivablesDiscountingExtended()
const rdBaseDocument = {
  toObject: () => rdBase
}
const rdExtendedDocument = {
  toObject: () => rdExtended
}

describe('ReceivablesDiscountingDataAgent', () => {
  let rdDataAgent: ReceivablesDiscountingDataAgent

  beforeAll(() => {
    ReceivablesDiscountingModel.create = createMock
    ReceivablesDiscountingModel.findOne = findOneMock
    ReceivablesDiscountingModel.updateOne = updateOneMock
    ReceivablesDiscountingModel.findOneAndUpdate = findOneAndUpdateMock
    ReceivablesDiscountingModel.find = findMock
    ReceivablesDiscountingModel.aggregate = aggregateMock
  })

  beforeEach(() => {
    rdDataAgent = new ReceivablesDiscountingDataAgent()
  })

  describe('create', () => {
    it('should return the saved object', async () => {
      createMock.mockResolvedValueOnce(rdBaseDocument)

      const savedData = await rdDataAgent.create(rdBase)
      expect(savedData).toEqual(rdBase)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockRejectedValueOnce(new Error())

      await expect(rdDataAgent.create(rdBase)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('updateCreate', () => {
    it('should throw a DataLayerError if the call to DB fails', async () => {
      updateOneMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(rdDataAgent.updateCreate(rdExtended)).rejects.toThrowError(DataLayerError)
    })

    it('should create or update a received RD without using default timestamps', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      const exec = jest.fn()
      updateOneMock.mockReturnValueOnce({ exec })

      await rdDataAgent.updateCreate(rd)

      expect(exec).toHaveBeenCalled()
      await expect(updateOneMock).toHaveBeenCalledWith(
        { staticId: rd.staticId, createdAt: rd.createdAt },
        { ...rd },
        { upsert: true, timestamps: false }
      )
    })
  })

  describe('update', () => {
    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(rdDataAgent.update(rdExtended.staticId, rdBase)).rejects.toThrowError(DataLayerError)
    })

    it('should return the updated RD', async () => {
      createMock.mockResolvedValueOnce(rdBaseDocument)

      await expect(rdDataAgent.update(rdExtended.staticId, rdBase)).resolves.toMatchObject(rdBase)
    })
  })

  describe('replace', () => {
    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneAndUpdateMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(rdDataAgent.replace(rdExtended.staticId, rdBase)).rejects.toThrowError(DataLayerError)
    })

    it('should update the RD', async () => {
      findOneAndUpdateMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(rdExtendedDocument)
      })

      await expect(rdDataAgent.replace(rdExtended.staticId, rdBase)).resolves.toBe(rdExtended)
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { staticId: rdExtended.staticId },
        { $set: rdBase },
        {
          new: true,
          upsert: false
        }
      )
    })
  })

  describe('findByStaticId', () => {
    it('should return a receivables discounting data for the given static id', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([rdBaseDocument]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await rdDataAgent.findByStaticId('staticId')
      expect(savedData).toEqual(rdBase)
    })

    it('should return a null if the receviables discouting data is not found', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await rdDataAgent.findByStaticId('staticId')
      expect(savedData).toEqual(null)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findMock.mockReturnValueOnce({ limit: jest.fn().mockReturnValue(new Error()) })

      await expect(rdDataAgent.findByStaticId('staticId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findAllByStaticId', () => {
    it('should return all receivables discounting data for the given staticId', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([rdBaseDocument, rdBaseDocument]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }

      findMock.mockReturnValueOnce(sortMock)

      const savedData = await rdDataAgent.findAllByStaticId('staticId')
      expect(savedData).toEqual([rdBase, rdBase])
    })

    it('should return an empty array if no receivables discounting data is found for the given staticId', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }

      findMock.mockReturnValueOnce(sortMock)

      const savedData = await rdDataAgent.findAllByStaticId('staticId')
      expect(savedData).toEqual([])
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findMock.mockReturnValueOnce({ limit: jest.fn().mockReturnValue(new Error()) })

      await expect(rdDataAgent.findAllByStaticId('staticId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByTrade', () => {
    it('should return a receivables discounting data for the given trade details', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([rdBaseDocument]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await rdDataAgent.findByTrade(
        rdBase.tradeReference.sourceId,
        rdBase.tradeReference.sellerEtrmId
      )
      expect(savedData).toEqual(rdBase)
    })

    it('should return null if receivables discounting data is not found', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await rdDataAgent.findByTrade(
        rdBase.tradeReference.sourceId,
        rdBase.tradeReference.sellerEtrmId
      )
      expect(savedData).toEqual(null)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(
        rdDataAgent.findByTrade(rdBase.tradeReference.sourceId, rdBase.tradeReference.sellerEtrmId)
      ).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByTradeSourceId', () => {
    it('should return a receivables discounting data for the given trade details', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([rdBaseDocument]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await rdDataAgent.findByTradeSourceId(rdBase.tradeReference.sourceId)
      expect(savedData).toEqual(rdBase)
    })

    it('should return null if receivables discounting data is not found', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await rdDataAgent.findByTradeSourceId(rdBase.tradeReference.sourceId)
      expect(savedData).toEqual(null)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(rdDataAgent.findByTradeSourceId(rdBase.tradeReference.sourceId)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByTradeSourceIds', () => {
    const sourceIds = ['sourceId1', 'sourceId2']

    it('should return all receivables discounting', async () => {
      aggregateMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([{ _id: 'rdId', lastRDCreated: rdBase }])
      })

      const savedData = await rdDataAgent.findByTradeSourceIds(sourceIds)
      expect(savedData).toEqual([rdBase])
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findMock.mockReturnValueOnce({ sort: () => ({ exec: jest.fn().mockRejectedValueOnce(new Error()) }) })

      await expect(rdDataAgent.findByTradeSourceIds(sourceIds)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findAll', () => {
    it('should return all receivables discounting', async () => {
      aggregateMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([{ _id: 'rdId', lastRDCreated: rdBase }])
      })

      const savedData = await rdDataAgent.findAll()

      expect(savedData).toEqual([rdBase])
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      aggregateMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })
      await expect(rdDataAgent.findAll()).rejects.toThrowError(DataLayerError)
    })
  })
})
