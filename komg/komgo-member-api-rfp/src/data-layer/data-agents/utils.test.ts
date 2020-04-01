import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger, getLogger } from '@komgo/logging'
import { createMockInstance } from 'jest-create-mock-instance'

import { ErrorName } from '../../ErrorName'

import { logAndThrowMongoError, MONGODB_VALIDATION_ERROR_NAME, MONGODB_DUPLICATE_ERROR, toObject } from './utils'
import DatabaseError from './DatabaseError'

const ERROR_MESSAGE = 'Unable to save data'

const mockObject = {
  objectId: 'id'
}
const mockDocument = {
  toObject: jest.fn().mockReturnValue(mockObject)
}

describe('utils', () => {
  describe('toObject', () => {
    it('should call toObject of the mongoose document successfully', async () => {
      const result = toObject(mockDocument as any)

      expect(mockDocument.toObject).toHaveBeenCalled()
      expect(result).toEqual(mockObject)
    })

    it('should return null if document is null', async () => {
      const result = toObject(null)

      expect(result).toBeNull()
    })
  })

  describe('logMongoError', () => {
    let logger: jest.Mocked<LogstashCapableLogger>

    beforeEach(() => {
      logger = createMockInstance(LogstashCapableLogger)
      logger.error = jest.fn()
    })

    it('should log mongo validation errors', async () => {
      const error = {
        name: MONGODB_VALIDATION_ERROR_NAME,
        errors: 'Validation errors 123',
        errmsg: 'errored',
        code: 11001
      }

      try {
        logAndThrowMongoError(logger, error)
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError)
      }

      expect(logger.error).toBeCalledWith(
        ErrorCode.DatabaseInvalidData,
        ErrorName.MongoValidationFailed,
        ERROR_MESSAGE,
        expect.objectContaining({
          code: 11001,
          errorName: MONGODB_VALIDATION_ERROR_NAME,
          mongoErrmsg: 'errored',
          validationErrors: 'Validation errors 123'
        })
      )
    })

    it('should log mongo duplicate error', async () => {
      const error = {
        name: 'duplicate',
        errors: 'Duplicate errors',
        errmsg: 'errored',
        code: MONGODB_DUPLICATE_ERROR
      }

      try {
        logAndThrowMongoError(logger, error)
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError)
      }

      expect(logger.error).toBeCalledWith(
        ErrorCode.DatabaseInvalidData,
        ErrorName.MongoDuplicateError,
        ERROR_MESSAGE,
        expect.objectContaining({
          code: MONGODB_DUPLICATE_ERROR,
          errorMessage: undefined,
          errorName: 'duplicate',
          mongoErrmsg: 'errored'
        })
      )
    })

    it('should log mongo non specific error', async () => {
      const error = {
        name: 'Non-specific-error',
        errmsg: 'errored',
        code: 12345
      }

      try {
        logAndThrowMongoError(logger, error)
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError)
      }

      expect(logger.error).toBeCalledWith(
        ErrorCode.ConnectionDatabase,
        ErrorName.MongoError,
        ERROR_MESSAGE,
        expect.objectContaining({
          code: 12345,
          errorMessage: undefined,
          errorName: 'Non-specific-error',
          mongoErrmsg: 'errored'
        })
      )
    })
  })
})
