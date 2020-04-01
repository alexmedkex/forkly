import { ErrorCode } from '@komgo/error-utilities'
import { ActionStatus } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { ValidationFieldError, ValidationDuplicateError, MicroserviceClientError } from '../../business-layer/errors'
import {
  AcceptQuoteUseCase,
  CreateRFPRequestUseCase,
  RejectRFPUseCase,
  SubmitQuoteUseCase
} from '../../business-layer/rfp/use-cases'
import { DataLayerError } from '../../data-layer/errors'
import { ReceivablesDiscountingRFPRequest, QuoteSubmission, RFPReply, QuoteAccept } from '../requests'

import { RFPController } from './RFPController'
import { MOCK_ENCODED_JWT } from './utils/getUserId.test'

describe('RFPController', () => {
  let controller: RFPController
  let mockCreateRFPRequestUseCase: jest.Mocked<CreateRFPRequestUseCase>
  let mockSubmitQuoteUseCase: jest.Mocked<SubmitQuoteUseCase>
  let mockRejectRFPUseCase: jest.Mocked<RejectRFPUseCase>
  let mockAcceptQuoteUseCase: jest.Mocked<AcceptQuoteUseCase>

  beforeEach(() => {
    mockCreateRFPRequestUseCase = createMockInstance(CreateRFPRequestUseCase)
    mockSubmitQuoteUseCase = createMockInstance(SubmitQuoteUseCase)
    mockRejectRFPUseCase = createMockInstance(RejectRFPUseCase)
    mockAcceptQuoteUseCase = createMockInstance(AcceptQuoteUseCase)

    controller = new RFPController(
      mockCreateRFPRequestUseCase,
      mockSubmitQuoteUseCase,
      mockRejectRFPUseCase,
      mockAcceptQuoteUseCase
    )
  })

  describe('create', () => {
    const mockRFPRequest: ReceivablesDiscountingRFPRequest = {
      rdId: uuid4(),
      participantStaticIds: ['participant0', 'participant1']
    }

    it('should create a RFP Request successfully', async () => {
      const expectedResult = {
        staticId: 'rfpId',
        actionStatuses: [
          {
            recipientStaticId: 'recipientStaticId',
            status: 'Processed'
          }
        ]
      }
      mockCreateRFPRequestUseCase.execute.mockResolvedValueOnce(expectedResult as any)

      const result = await controller.create(mockRFPRequest)

      expect(result).toEqual(expectedResult)
      expect(mockCreateRFPRequestUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with ValidationHttpContent and 422 status if rdId is not UUID', async () => {
      try {
        await controller.create({ ...mockRFPRequest, rdId: 'notUUID' })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationHttpContent and 422 status if participantStaticIds is empty', async () => {
      try {
        await controller.create({ ...mockRFPRequest, participantStaticIds: [] })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationInvalidOperation and 422 status if CreateRFPRequestUseCase throws ValidationFieldError', async () => {
      mockCreateRFPRequestUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.create(mockRFPRequest)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with DatabaseInvalidData and 409 status if CreateRFPRequestUseCase throws ValidationDuplicateError', async () => {
      mockCreateRFPRequestUseCase.execute.mockRejectedValueOnce(new ValidationDuplicateError('msg'))

      try {
        await controller.create(mockRFPRequest)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(409)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with ConnectionMicroservice and 500 status if CreateRFPRequestUseCase throws MicroserviceClientError', async () => {
      mockCreateRFPRequestUseCase.execute.mockRejectedValueOnce(new MicroserviceClientError())

      try {
        await controller.create(mockRFPRequest)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionMicroservice)
      }
    })

    it('should fail with the error code of the error and 500 status if CreateRFPRequestUseCase throws DataLayerError', async () => {
      mockCreateRFPRequestUseCase.execute.mockRejectedValueOnce(
        new DataLayerError('msg', ErrorCode.DatabaseInvalidData)
      )

      try {
        await controller.create(mockRFPRequest)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with UnexpectedError and 500 status if CreateRFPRequestUseCase throws an untyped error', async () => {
      mockCreateRFPRequestUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.create(mockRFPRequest)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })

  describe('submitQuote', () => {
    const mockQuoteSubmission: QuoteSubmission = {
      rdId: uuid4(),
      quoteId: uuid4(),
      comment: 'comment'
    }

    it('should submit a quote successfully', async () => {
      const expectedResult = {
        rfpId: 'rfpId',
        actionStatus: {
          recipientStaticId: 'recipientStaticId',
          status: 'Processed'
        }
      }
      mockSubmitQuoteUseCase.execute.mockResolvedValueOnce(expectedResult)

      const result = await controller.submitQuote(MOCK_ENCODED_JWT, mockQuoteSubmission)

      expect(result).toEqual(expectedResult)
      expect(mockSubmitQuoteUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with ValidationHttpContent and 422 status if rdId is not UUID', async () => {
      try {
        await controller.submitQuote(MOCK_ENCODED_JWT, { ...mockQuoteSubmission, rdId: 'notUUID' })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationHttpContent and 422 status if quoteId is not UUID', async () => {
      try {
        await controller.submitQuote(MOCK_ENCODED_JWT, { ...mockQuoteSubmission, quoteId: 'notUUID' })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationInvalidOperation and 422 status if SubmitQuoteUseCase throws ValidationFieldError', async () => {
      mockSubmitQuoteUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.submitQuote(MOCK_ENCODED_JWT, mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with DatabaseInvalidData and 409 status if SubmitQuoteUseCase throws ValidationDuplicateError', async () => {
      mockSubmitQuoteUseCase.execute.mockRejectedValueOnce(new ValidationDuplicateError('msg'))

      try {
        await controller.submitQuote(MOCK_ENCODED_JWT, mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(409)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with ConnectionMicroservice and 500 status if SubmitQuoteUseCase throws MicroserviceClientError', async () => {
      mockSubmitQuoteUseCase.execute.mockRejectedValueOnce(new MicroserviceClientError())

      try {
        await controller.submitQuote(MOCK_ENCODED_JWT, mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionMicroservice)
      }
    })

    it('should fail with UnexpectedError and 500 status if SubmitQuoteUseCase throws an untyped error', async () => {
      mockSubmitQuoteUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.submitQuote(MOCK_ENCODED_JWT, mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })

  describe('reject', () => {
    const mockRFPReply: RFPReply = {
      rdId: uuid4(),
      comment: 'comment'
    }

    it('should submit a rejection successfully', async () => {
      const expectedResult = {
        rfpId: 'rfpId',
        actionStatus: {
          recipientStaticId: 'recipientStaticId',
          status: 'Processed'
        }
      }
      mockRejectRFPUseCase.execute.mockResolvedValueOnce(expectedResult)

      const result = await controller.reject(MOCK_ENCODED_JWT, mockRFPReply)

      expect(result).toEqual(expectedResult)
      expect(mockRejectRFPUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with ValidationHttpContent and 422 status if rdId is not UUID', async () => {
      try {
        await controller.reject(MOCK_ENCODED_JWT, { ...mockRFPReply, rdId: 'notUUID' })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationInvalidOperation and 422 status if RejectRFPUseCase throws ValidationFieldError', async () => {
      mockRejectRFPUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.reject(MOCK_ENCODED_JWT, mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with DatabaseInvalidData and 409 status if RejectRFPUseCase throws ValidationDuplicateError', async () => {
      mockRejectRFPUseCase.execute.mockRejectedValueOnce(new ValidationDuplicateError('msg'))

      try {
        await controller.reject(MOCK_ENCODED_JWT, mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(409)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with ConnectionMicroservice and 500 status if RejectRFPUseCase throws MicroserviceClientError', async () => {
      mockRejectRFPUseCase.execute.mockRejectedValueOnce(new MicroserviceClientError())

      try {
        await controller.reject(MOCK_ENCODED_JWT, mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionMicroservice)
      }
    })

    it('should fail with UnexpectedError and 500 status if RejectRFPUseCase throws an untyped error', async () => {
      mockRejectRFPUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.reject(MOCK_ENCODED_JWT, mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })

  describe('acceptQuote', () => {
    const mockQuoteAccept: QuoteAccept = {
      rdId: uuid4(),
      quoteId: uuid4(),
      participantStaticId: uuid4(),
      comment: 'comment'
    }

    it('should accept a quote successfully', async () => {
      const expectedResult = {
        rfpId: 'rfpId',
        actionStatuses: [
          {
            recipientStaticId: 'recipientStaticId',
            status: ActionStatus.Processed
          }
        ]
      }
      mockAcceptQuoteUseCase.execute.mockResolvedValueOnce(expectedResult)

      const result = await controller.acceptQuote(MOCK_ENCODED_JWT, mockQuoteAccept)

      expect(result).toEqual(expectedResult)
      expect(mockAcceptQuoteUseCase.execute).toHaveBeenCalledTimes(1)
    })

    it('should fail with ValidationHttpContent and 422 status if rdId is not UUID', async () => {
      try {
        await controller.acceptQuote(MOCK_ENCODED_JWT, { ...mockQuoteAccept, rdId: 'notUUID' })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationHttpContent and 422 status if quoteId is not UUID', async () => {
      try {
        await controller.acceptQuote(MOCK_ENCODED_JWT, { ...mockQuoteAccept, quoteId: 'notUUID' })
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationHttpContent)
      }
    })

    it('should fail with ValidationInvalidOperation and 422 status if AcceptQuoteUseCase throws ValidationFieldError', async () => {
      mockAcceptQuoteUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.acceptQuote(MOCK_ENCODED_JWT, mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with DatabaseInvalidData and 409 status if AcceptQuoteUseCase throws ValidationDuplicateError', async () => {
      mockAcceptQuoteUseCase.execute.mockRejectedValueOnce(new ValidationDuplicateError('msg'))

      try {
        await controller.acceptQuote(MOCK_ENCODED_JWT, mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(409)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseInvalidData)
      }
    })

    it('should fail with ConnectionMicroservice and 500 status if AcceptQuoteUseCase throws MicroserviceClientError', async () => {
      mockAcceptQuoteUseCase.execute.mockRejectedValueOnce(new MicroserviceClientError())

      try {
        await controller.acceptQuote(MOCK_ENCODED_JWT, mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionMicroservice)
      }
    })

    it('should fail with UnexpectedError and 500 status if AcceptQuoteUseCase throws an untyped error', async () => {
      mockAcceptQuoteUseCase.execute.mockRejectedValueOnce(new Error())

      try {
        await controller.acceptQuote(MOCK_ENCODED_JWT, mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.UnexpectedError)
      }
    })
  })
})
