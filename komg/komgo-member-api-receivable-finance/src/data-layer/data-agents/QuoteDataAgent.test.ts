import { buildFakeQuoteBase, buildFakeQuote } from '@komgo/types'

import { DataLayerError } from '../errors'
import { QuoteModel } from '../models/quote/QuoteModel'

import { QuoteDataAgent } from './QuoteDataAgent'

const createMock = jest.fn()
const findMock = jest.fn()
const updateOneMock = jest.fn()

describe('QuoteDataAgent', () => {
  let dataAgent: QuoteDataAgent

  beforeAll(() => {
    QuoteModel.create = createMock
    QuoteModel.find = findMock
    QuoteModel.updateOne = updateOneMock
  })

  beforeEach(() => {
    dataAgent = new QuoteDataAgent()
  })

  describe('create', () => {
    const mockQuote = buildFakeQuoteBase()
    const mockQuoteDocument = {
      toObject: () => mockQuote
    }

    it('should return the saved object', async () => {
      createMock.mockResolvedValueOnce(mockQuoteDocument)

      const savedData = await dataAgent.create(mockQuote)
      expect(savedData).toEqual(mockQuote)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockRejectedValueOnce(new Error())

      await expect(dataAgent.create(mockQuote)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('updateCreate', () => {
    it('should throw a DataLayerError if the call to DB fails', async () => {
      updateOneMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(dataAgent.updateCreate(buildFakeQuote())).rejects.toThrowError(DataLayerError)
    })

    it('should create or update a received quote without using default timestamps', async () => {
      const quote = buildFakeQuote()
      const exec = jest.fn()
      updateOneMock.mockReturnValueOnce({ exec })

      await dataAgent.updateCreate(quote)

      expect(exec).toHaveBeenCalled()
      await expect(updateOneMock).toHaveBeenCalledWith(
        { staticId: quote.staticId, createdAt: quote.createdAt },
        { ...quote },
        { upsert: true, timestamps: false, setDefaultsOnInsert: true }
      )
    })
  })

  describe('update', () => {
    const mockQuote = buildFakeQuoteBase()
    const mockQuoteDocument = {
      toObject: () => mockQuote
    }

    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(dataAgent.update('staticId', mockQuote)).rejects.toThrowError(DataLayerError)
    })

    it('should return the updated quote', async () => {
      createMock.mockResolvedValueOnce(mockQuoteDocument)

      await expect(dataAgent.update('staticId', mockQuote)).resolves.toMatchObject(mockQuote)
    })
  })

  describe('findByStaticId', () => {
    const mockQuote = buildFakeQuote()
    const mockQuoteDocument = {
      toObject: () => mockQuote
    }

    it('should return latest quote for the given static id', async () => {
      const mockQuote2 = { ...mockQuote, staticId: 'staticIdQuote2' }
      const mockQuoteDocument2 = {
        toObject: () => mockQuote2
      }
      const execMock = { exec: jest.fn().mockResolvedValueOnce([mockQuoteDocument, mockQuoteDocument2]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await dataAgent.findByStaticId('staticId')
      expect(savedData).toEqual(mockQuote)
    })

    it('should return a null if the quote is not found', async () => {
      const execMock = { exec: jest.fn().mockResolvedValueOnce([]) }
      const sortMock = { sort: jest.fn().mockReturnValue(execMock) }
      const limitMock = { limit: jest.fn().mockReturnValue(sortMock) }

      findMock.mockReturnValueOnce(limitMock)

      const savedData = await dataAgent.findByStaticId('staticId')
      expect(savedData).toEqual(null)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      const staticId = 'quoteId'
      findMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(dataAgent.findByStaticId(staticId)).rejects.toThrowError(DataLayerError)
    })
  })
})
