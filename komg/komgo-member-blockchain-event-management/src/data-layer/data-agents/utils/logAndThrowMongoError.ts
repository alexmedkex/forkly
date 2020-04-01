import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'

import { ErrorName } from '../../../util/ErrorName'
import { DatabaseError } from '../errors'

export const MONGODB_DUPLICATE_ERROR = 11000
export const MONGODB_VALIDATION_ERROR_NAME = 'ValidationError'

export const logAndThrowMongoError = (logger: LogstashCapableLogger, error: any, msg: string) => {
  const errorContext: any = {
    code: error.code,
    errorMessage: error.message,
    mongoErrmsg: error.errmsg,
    errorName: error.name
  }

  let errorCode: ErrorCode
  let errorName: string

  if (error.name === MONGODB_VALIDATION_ERROR_NAME) {
    errorCode = ErrorCode.DatabaseInvalidData
    errorName = ErrorName.MongoValidationFailed
    errorContext.validationErrors = error.errors
  } else if (error.code === MONGODB_DUPLICATE_ERROR) {
    errorCode = ErrorCode.DatabaseInvalidData
    errorName = ErrorName.MongoDuplicateError
  } else {
    errorCode = ErrorCode.ConnectionDatabase
    errorName = ErrorName.MongoError
  }

  logger.error(errorCode, errorName, msg, errorContext)

  throw new DatabaseError(error.message, errorCode)
}
