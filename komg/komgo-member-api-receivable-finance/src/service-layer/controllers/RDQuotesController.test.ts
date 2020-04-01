import { ErrorCode } from '@komgo/error-utilities'
import { buildFakeQuoteBase, buildFakeQuote, IQuote, IHistory } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ValidationFieldError, EntityNotFoundError, OutboundPublisherError } from '../../business-layer/errors'
import {
  CreateQuoteUseCase,
  GetQuoteUseCase,
  UpdateQuoteUseCase,
  ShareQuoteUseCase,
  GetQuoteHistoryUseCase
} from '../../business-layer/quotes/use-cases'
import { DataLayerError } from '../../data-layer/errors'

import { RDQuotesController } from './RDQuotesController'

describe('RDQuotesController', () => {
  let controller: RDQuotesController
  let mockCreateQuoteUseCase: jest.Mocked<CreateQuoteUseCase>
  let mockGetQuoteUseCase: jest.Mocked<GetQuoteUseCase>
  let mockUpdateQuoteUseCase: jest.Mocked<UpdateQuoteUseCase>
  let mockShareQuoteUseCase: jest.Mocked<ShareQuoteUseCase>
  let mockGetQuoteHistoryUseCase: jest.Mocked<GetQuoteHistoryUseCase>

  beforeEach(() => {
    mockCreateQuoteUseCase = createMockInstance(CreateQuoteUseCase)
    mockGetQuoteUseCase = createMockInstance(GetQuoteUseCase)
    mockUpdateQuoteUseCase = createMockInstance(UpdateQuoteUseCase)
    mockShareQuoteUseCase = createMockInstance(ShareQuoteUseCase)
    mockGetQuoteHistoryUseCase = createMockInstance(GetQuoteHistoryUseCase)

    controller = new RDQuotesController(
      mockCreateQuoteUseCase,
      mockGetQuoteUseCase,
      mockUpdateQuoteUseCase,
      mockShareQuoteUseCase,
      mockGetQuoteHistoryUseCase
    )
  })

  describe('get', () => {
    const mockQuote = buildFakeQuote()

    it('should create a quote successfully', async () => {
      const quoteStaticId = 'quoteId'
      mockGetQuoteUseCase.execute.mockResolvedValueOnce(mockQuote)

      const result = await controller.get(quoteStaticId)

      expect(result).toEqual(mockQuote)
      expect(mockGetQuoteUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with 404 status if GetQuoteUseCase throws EntityNotFoundError', async () => {
      const quoteStaticId = 'quoteId'
      mockGetQuoteUseCase.execute.mockRejectedValueOnce(new EntityNotFoundError('msg'))

      try {
        await controller.get(quoteStaticId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(404)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })
  })

  describe('create', () => {
    const mockQuoteBase = buildFakeQuoteBase()

    it('should create a quote successfully', async () => {
      const quoteStaticId = 'quoteId'
      mockCreateQuoteUseCase.execute.mockResolvedValueOnce(quoteStaticId)

      const result = await controller.create(mockQuoteBase)

      expect(result).toEqual({ staticId: quoteStaticId })
      expect(mockCreateQuoteUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with ValidationInvalidOperation and 422 status if CreateQuoteUseCase throws ValidationFieldError', async () => {
      mockCreateQuoteUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.create(mockQuoteBase)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with the error code of the error and 500 status if CreateQuoteUseCase throws DataLayerError', async () => {
      mockCreateQuoteUseCase.execute.mockRejectedValueOnce(new DataLayerError('msg', ErrorCode.DatabaseInvalidData))

      try {
        await controller.create(mockQuoteBase)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with UnexpectedError and 500 status if CreateQuoteUseCase throws an untyped error', async () => {
      mockCreateQuoteUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.create(mockQuoteBase)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })

  describe('update', () => {
    const mockQuoteBase = buildFakeQuoteBase()

    it('should update a quote successfully', async () => {
      const mockUpdated = { ...mockQuoteBase, staticId: 'test', createdAt: '2019-01-01' }
      mockUpdateQuoteUseCase.execute.mockResolvedValueOnce(mockUpdated)

      const result = await controller.update('mockStaticId', mockQuoteBase)

      expect(mockUpdateQuoteUseCase.execute).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockUpdated)
    })

    it('should fail with DatabaseMissingData and 404 status if update throws EntityNotFoundError', async () => {
      mockUpdateQuoteUseCase.execute.mockRejectedValueOnce(new EntityNotFoundError('msg'))

      try {
        await controller.update('mockStaticId', mockQuoteBase)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(404)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })

    it('should fail with ValidationInvalidOperation and 422 status if update throws ValidationFieldError', async () => {
      mockUpdateQuoteUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.update('mockStaticId', mockQuoteBase)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with ValidationInvalidOperation and 500 status if update throws DataLayerError', async () => {
      mockUpdateQuoteUseCase.execute.mockRejectedValueOnce(new DataLayerError('msg', ErrorCode.ConnectionDatabase))

      try {
        await controller.update('mockStaticId', mockQuoteBase)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionDatabase)
      }
    })
  })

  describe('share', () => {
    const quoteId = 'quoteId'

    it('should share the quote successfully', async () => {
      await controller.share(quoteId)

      expect(mockShareQuoteUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with ValidationInvalidOperation and 404 status if ShareQuoteUseCase throws EntityNotFoundError', async () => {
      mockShareQuoteUseCase.execute.mockRejectedValueOnce(new EntityNotFoundError('msg'))

      try {
        await controller.share(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(404)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })

    it('should fail with ValidationInvalidOperation and 422 status if ShareQuoteUseCase throws ValidationFieldError', async () => {
      mockShareQuoteUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.share(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with the error code of the error and 500 status if ShareQuoteUseCase throws DataLayerError', async () => {
      mockShareQuoteUseCase.execute.mockRejectedValueOnce(new DataLayerError('msg', ErrorCode.DatabaseInvalidData))

      try {
        await controller.share(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with the error code of the error and 500 status if ShareQuoteUseCase throws OutboundPublisherError', async () => {
      mockShareQuoteUseCase.execute.mockRejectedValueOnce(new OutboundPublisherError('msg'))

      try {
        await controller.share(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionInternalMQ)
      }
    })

    it('should fail with UnexpectedError and 500 status if ShareQuoteUseCase throws an untyped error', async () => {
      mockShareQuoteUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.share(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })

  describe('getHistory', () => {
    const quoteId = 'quoteId'

    it('should get the quote history successfully', async () => {
      const expectedHistory: IHistory<IQuote> = {
        id: 'quoteId',
        historyEntry: {
          advanceRate: [
            {
              updatedAt: 'myDate',
              value: 10
            }
          ]
        }
      }
      mockGetQuoteHistoryUseCase.execute.mockResolvedValueOnce(expectedHistory)
      const result = await controller.getHistory(quoteId)

      expect(mockGetQuoteHistoryUseCase.execute).toHaveBeenCalled()
      expect(result).toEqual(expectedHistory)
    })

    it('should fail with ValidationInvalidOperation and 404 status if GetQuoteHistoryUseCase throws EntityNotFoundError', async () => {
      mockGetQuoteHistoryUseCase.execute.mockRejectedValueOnce(new EntityNotFoundError('msg'))

      try {
        await controller.getHistory(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(404)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })

    it('should fail with UnexpectedError and 500 status if GetQuoteHistoryUseCase throws an untyped error', async () => {
      mockGetQuoteHistoryUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.getHistory(quoteId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })
})
