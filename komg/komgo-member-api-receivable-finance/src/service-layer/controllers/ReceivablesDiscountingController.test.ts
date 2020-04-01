import { ErrorCode } from '@komgo/error-utilities'
import { buildFakeReceivablesDiscountingBase, IParticipantRFPSummary, ParticipantRFPStatus } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import {
  ValidationFieldError,
  EntityNotFoundError,
  ValidationDuplicateError,
  OutboundPublisherError
} from '../../business-layer/errors'
import {
  CreateRDUseCase,
  ShareRDUseCase,
  UpdateRDUseCase,
  GetRDHistoryUseCase,
  ReplaceRDUseCase,
  AddDiscountingUseCase
} from '../../business-layer/rd/use-cases'
import { GetRFPSummaryUseCase, GetParticipantRFPSummaryUseCase } from '../../business-layer/rfp/use-cases'
import { DataLayerError } from '../../data-layer/errors'

import { ReceivablesDiscountingController } from './ReceivablesDiscountingController'

const STATIC_ID = 'rdId'

const rdBase = buildFakeReceivablesDiscountingBase()

describe('ReceivablesDiscountingController', () => {
  let controller: ReceivablesDiscountingController
  let mockCreateRDUseCase: jest.Mocked<CreateRDUseCase>
  let mockGetRFPSummaryUseCase: jest.Mocked<GetRFPSummaryUseCase>
  let mockGetParticipantRFPSummaryUseCase: jest.Mocked<GetParticipantRFPSummaryUseCase>
  let mockUpdateRDUseCase: jest.Mocked<UpdateRDUseCase>
  let mockReplaceRDUseCase: jest.Mocked<ReplaceRDUseCase>
  let mockShareRDUseCase: jest.Mocked<ShareRDUseCase>
  let mockGetRDHistoryUseCase: jest.Mocked<GetRDHistoryUseCase>
  let mockAddDiscountingUseCase: jest.Mocked<AddDiscountingUseCase>

  const EXPECTED_NOT_FOUND_ERROR = {
    error: new EntityNotFoundError(''),
    status: 404,
    code: ErrorCode.DatabaseMissingData
  }
  const EXPECTED_VALIDATION_ERROR = {
    error: new ValidationFieldError('', {}),
    status: 422,
    code: ErrorCode.ValidationInvalidOperation
  }
  const EXPECTED_DUPLICATE_ERROR = {
    error: new ValidationDuplicateError(''),
    status: 409,
    code: ErrorCode.DatabaseInvalidData
  }
  const EXPECTED_INVALID_DATA_ERROR = {
    error: new DataLayerError('', ErrorCode.DatabaseInvalidData),
    status: 500,
    code: ErrorCode.DatabaseInvalidData
  }
  const EXPECTED_UNEXPECTED_ERROR = { error: new Error(), status: 500, code: ErrorCode.UnexpectedError }
  const EXPECTED_INTERNAL_MQ_ERROR = {
    error: new OutboundPublisherError(''),
    status: 500,
    code: ErrorCode.ConnectionInternalMQ
  }

  beforeEach(() => {
    mockCreateRDUseCase = createMockInstance(CreateRDUseCase)
    mockGetRFPSummaryUseCase = createMockInstance(GetRFPSummaryUseCase)
    mockGetParticipantRFPSummaryUseCase = createMockInstance(GetParticipantRFPSummaryUseCase)
    mockUpdateRDUseCase = createMockInstance(UpdateRDUseCase)
    mockReplaceRDUseCase = createMockInstance(ReplaceRDUseCase)
    mockShareRDUseCase = createMockInstance(ShareRDUseCase)
    mockGetRDHistoryUseCase = createMockInstance(GetRDHistoryUseCase)
    mockAddDiscountingUseCase = createMockInstance(AddDiscountingUseCase)

    controller = new ReceivablesDiscountingController(
      mockCreateRDUseCase,
      mockUpdateRDUseCase,
      mockReplaceRDUseCase,
      mockGetRFPSummaryUseCase,
      mockGetParticipantRFPSummaryUseCase,
      mockShareRDUseCase,
      mockGetRDHistoryUseCase,
      mockAddDiscountingUseCase
    )
  })

  describe('create', () => {
    it('should create a new RD application successfully', async () => {
      const expectedResult = { staticId: STATIC_ID }
      mockCreateRDUseCase.execute.mockResolvedValueOnce(expectedResult)

      const result = await controller.create(rdBase)

      expect(result).toEqual(expectedResult)
      expect(mockCreateRDUseCase.execute).toHaveBeenCalledTimes(1)
    })

    describe.each([
      EXPECTED_VALIDATION_ERROR,
      EXPECTED_DUPLICATE_ERROR,
      EXPECTED_INVALID_DATA_ERROR,
      EXPECTED_UNEXPECTED_ERROR
    ])('errors', expectedError => {
      it(`should fail with ${expectedError.code} and status ${expectedError.status} if throws ${expectedError.error.constructor.name} `, async () => {
        mockCreateRDUseCase.execute.mockRejectedValueOnce(expectedError.error)

        try {
          await controller.create(rdBase)
          fail('Expected failure')
        } catch (error) {
          expect(error.status).toBe(expectedError.status)
          expect(error.errorObject.errorCode).toBe(expectedError.code)
        }
      })

      it('should fail with ValidationInvalidOperation and 422 status if CreateRDUseCase throws ValidationFieldError', async () => {
        mockCreateRDUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

        try {
          await controller.create(rdBase)
          fail('Expected failure')
        } catch (error) {
          expect(error.status).toBe(422)
          expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
        }
      })
    })

    describe('update', () => {
      it('should update an RD successfully', async () => {
        const mockUpdated = { ...rdBase, staticId: 'test', createdAt: '2019-01-01' }
        mockUpdateRDUseCase.execute.mockResolvedValueOnce(mockUpdated)

        const result = await controller.update('mockStaticId', rdBase)

        expect(mockUpdateRDUseCase.execute).toHaveBeenCalledTimes(1)
        expect(mockUpdateRDUseCase.execute).toHaveBeenCalledWith('mockStaticId', rdBase)
        expect(result).toEqual(expect.objectContaining(mockUpdated))
      })

      describe.each([EXPECTED_NOT_FOUND_ERROR, EXPECTED_VALIDATION_ERROR, EXPECTED_INVALID_DATA_ERROR])(
        'errors',
        expectedError => {
          it(`should fail with ${expectedError.code} and status ${expectedError.status} if throws ${expectedError.error.constructor.name} `, async () => {
            mockUpdateRDUseCase.execute.mockRejectedValueOnce(expectedError.error)

            try {
              await controller.update('mockStaticId', rdBase)
              fail('Expected failure')
            } catch (error) {
              expect(error.status).toBe(expectedError.status)
              expect(error.errorObject.errorCode).toBe(expectedError.code)
            }
          })
        }
      )
    })

    describe('update?replace=true', () => {
      it('should replace an RD successfully', async () => {
        const mockUpdated = { ...rdBase, staticId: 'test', createdAt: '2019-01-01' }
        mockReplaceRDUseCase.execute.mockResolvedValueOnce(mockUpdated)

        const result = await controller.update('mockStaticId', rdBase, true)

        expect(mockUpdateRDUseCase.execute).not.toHaveBeenCalled()
        expect(mockReplaceRDUseCase.execute).toHaveBeenCalledWith('mockStaticId', rdBase)
        expect(result).toEqual(expect.objectContaining(mockUpdated))
      })

      describe.each([EXPECTED_NOT_FOUND_ERROR, EXPECTED_VALIDATION_ERROR, EXPECTED_INVALID_DATA_ERROR])(
        'errors',
        expectedError => {
          it(`should fail with ${expectedError.code} and status ${expectedError.status} if throws ${expectedError.error.constructor.name} `, async () => {
            mockReplaceRDUseCase.execute.mockRejectedValueOnce(expectedError.error)

            try {
              await controller.update('mockStaticId', rdBase, true)
              fail('Expected failure')
            } catch (error) {
              expect(error.status).toBe(expectedError.status)
              expect(error.errorObject.errorCode).toBe(expectedError.code)
            }
          })
        }
      )
    })

    describe('getRFP', () => {
      const RD_ID = 'rdId'

      it('should get RFP summaries', async () => {
        const summaries = [{}, {}]

        mockGetRFPSummaryUseCase.execute.mockResolvedValueOnce(summaries as any)

        const result = await controller.getRFP(RD_ID)

        expect(result).toEqual({ summaries })
      })

      describe.each([EXPECTED_NOT_FOUND_ERROR, EXPECTED_INVALID_DATA_ERROR])('errors', expectedError => {
        it(`should fail with ${expectedError.code} and status ${expectedError.status} if throws ${expectedError.error.constructor.name} `, async () => {
          mockGetRFPSummaryUseCase.execute.mockRejectedValueOnce(expectedError.error)

          try {
            await controller.getRFP(RD_ID)
            fail('Expected failure')
          } catch (error) {
            expect(error.status).toBe(expectedError.status)
            expect(error.errorObject.errorCode).toBe(expectedError.code)
          }
        })
      })
    })

    describe('getParticipantRFP', () => {
      const RD_ID = 'rdId'
      const PARTICIPANT_ID = 'test'

      it('should get participant RFP summary', async () => {
        const summary: IParticipantRFPSummary = {
          participantStaticId: PARTICIPANT_ID,
          replies: [],
          status: ParticipantRFPStatus.QuoteAccepted
        }

        mockGetParticipantRFPSummaryUseCase.execute.mockResolvedValueOnce(summary)

        const result = await controller.getParticipantRFP(RD_ID, PARTICIPANT_ID)

        expect(result).toEqual(summary)
      })

      describe.each([EXPECTED_NOT_FOUND_ERROR, EXPECTED_INVALID_DATA_ERROR])('errors', expectedError => {
        it(`should fail with ${expectedError.error.constructor.name} and ${expectedError.status}, ErrorCode ${expectedError.code}`, async () => {
          mockGetParticipantRFPSummaryUseCase.execute.mockRejectedValueOnce(expectedError.error)

          try {
            await controller.getParticipantRFP(RD_ID, PARTICIPANT_ID)
            fail('Expected failure')
          } catch (error) {
            expect(error.status).toBe(expectedError.status)
            expect(error.errorObject.errorCode).toBe(expectedError.code)
          }
        })
      })
    })

    describe('share', () => {
      const RD_ID = 'rdId'
      it('should share the RD successfully', async () => {
        await controller.share(RD_ID)

        expect(mockShareRDUseCase.execute).toHaveBeenCalledTimes(1)
      })

      describe.each([
        EXPECTED_VALIDATION_ERROR,
        EXPECTED_INVALID_DATA_ERROR,
        EXPECTED_INTERNAL_MQ_ERROR,
        EXPECTED_UNEXPECTED_ERROR
      ])('errors', expectedError => {
        it(`should fail with ${expectedError.code} and status ${expectedError.status} if throws ${expectedError.error.constructor.name} `, async () => {
          mockShareRDUseCase.execute.mockRejectedValueOnce(expectedError.error)

          try {
            await controller.share(RD_ID)
            fail('Expected failure')
          } catch (error) {
            expect(error.status).toBe(expectedError.status)
            expect(error.errorObject.errorCode).toBe(expectedError.code)
          }
        })
      })
    })

    describe('add-discounting request', () => {
      const RD_ID = 'rdId'
      it('should send add-discounting request successfully', async () => {
        await controller.addDiscounting(RD_ID)

        expect(mockAddDiscountingUseCase.execute).toHaveBeenCalledTimes(1)
      })

      describe.each([
        EXPECTED_VALIDATION_ERROR,
        EXPECTED_INVALID_DATA_ERROR,
        EXPECTED_INTERNAL_MQ_ERROR,
        EXPECTED_UNEXPECTED_ERROR
      ])('errors', expectedError => {
        it(`should fail with ${expectedError.code} and status ${expectedError.status} if throws ${expectedError.error.constructor.name} `, async () => {
          mockAddDiscountingUseCase.execute.mockRejectedValueOnce(expectedError.error)

          try {
            await controller.addDiscounting(RD_ID)
            fail('Expected failure')
          } catch (error) {
            expect(error.status).toBe(expectedError.status)
            expect(error.errorObject.errorCode).toBe(expectedError.code)
          }
        })
      })
    })
  })
})
