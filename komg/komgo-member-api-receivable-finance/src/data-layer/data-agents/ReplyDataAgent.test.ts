import { ReplyType } from '@komgo/types'
import 'reflect-metadata'

import { DataLayerError } from '../errors'
import { ReplyModel } from '../models/replies/ReplyModel'

import { ReplyDataAgent } from './ReplyDataAgent'
import { buildFakeReply } from './utils/faker'

const createMock = jest.fn()
const findMock = jest.fn()
const findOneMock = jest.fn()
const updateOneMock = jest.fn()
const rfpSubmittedReply = buildFakeReply({ type: ReplyType.Accepted })
const rfpSubmittedReplyDocument = {
  toObject: () => rfpSubmittedReply
}

describe('ReplyDataAgent', () => {
  let replyDataAgent: ReplyDataAgent

  beforeAll(() => {
    ReplyModel.create = createMock
    ReplyModel.findOne = findOneMock
    ReplyModel.updateOne = updateOneMock
    ReplyModel.find = findMock
  })

  beforeEach(() => {
    replyDataAgent = new ReplyDataAgent()
  })

  describe('create', () => {
    it('should return the saved object', async () => {
      createMock.mockResolvedValueOnce(rfpSubmittedReplyDocument)

      const savedData = await replyDataAgent.create(rfpSubmittedReply)

      expect(savedData).toEqual(rfpSubmittedReply)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockRejectedValueOnce(new Error())

      await expect(replyDataAgent.create(rfpSubmittedReply)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByStaticId', () => {
    it('should return a RD response for the given rdId', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(rfpSubmittedReplyDocument)
      })

      const savedData = await replyDataAgent.findByStaticId('staticId')
      expect(savedData).toEqual(rfpSubmittedReply)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(replyDataAgent.findByStaticId('staticId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByRdId', () => {
    it('should return a RD reply for the given rdId', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(rfpSubmittedReplyDocument)
      })

      const savedData = await replyDataAgent.findByRdId('rdId')
      expect(savedData).toEqual(rfpSubmittedReply)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(replyDataAgent.findByRdId('rdId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByRdIdAndType', () => {
    it('should return a RD reply for the given rdId', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(rfpSubmittedReplyDocument)
      })

      const savedData = await replyDataAgent.findByRdIdAndType('rdId', ReplyType.Accepted)
      expect(savedData).toEqual(rfpSubmittedReply)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(replyDataAgent.findByRdId('rdId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByQuoteIdAndType', () => {
    it('should return a RD reply for the given quoteId', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(rfpSubmittedReplyDocument)
      })

      const savedData = await replyDataAgent.findByQuoteIdAndType('quoteId', ReplyType.Accepted)
      expect(savedData).toEqual(rfpSubmittedReply)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(replyDataAgent.findByQuoteIdAndType('quoteId', ReplyType.Accepted)).rejects.toThrowError(
        DataLayerError
      )
    })
  })

  describe('findAllByRdId', () => {
    it('should return multiple RD replies for the given rdId', async () => {
      findMock.mockReturnValueOnce({
        sort: () => ({ exec: async () => [rfpSubmittedReplyDocument] })
      })

      const savedData = await replyDataAgent.findAllByRdId('rdId')
      expect(savedData).toEqual([rfpSubmittedReply])
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      findMock.mockReturnValueOnce({ sort: () => ({ exec: jest.fn().mockRejectedValueOnce(new Error()) }) })

      await expect(replyDataAgent.findAllByRdId('rdId')).rejects.toThrowError(DataLayerError)
    })
  })

  describe('updateCreate', () => {
    it('should throw a DataLayerError if the call to DB fails', async () => {
      updateOneMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(replyDataAgent.updateCreate(rfpSubmittedReply)).rejects.toThrowError(DataLayerError)
    })

    it('should create or update a received RFP Reply without using default timestamps', async () => {
      const exec = jest.fn()
      updateOneMock.mockReturnValueOnce({ exec })

      await replyDataAgent.updateCreate(rfpSubmittedReply)

      expect(exec).toHaveBeenCalled()
      await expect(updateOneMock).toHaveBeenCalledWith(
        { staticId: rfpSubmittedReply.staticId, createdAt: rfpSubmittedReply.createdAt },
        rfpSubmittedReply,
        { upsert: true, timestamps: false, setDefaultsOnInsert: true }
      )
    })
  })
})
