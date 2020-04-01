import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import Mongoose from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { ErrorName } from '../../ErrorName'

import DatabaseError from './DatabaseError'

export const MONGODB_DUPLICATE_ERROR = 11000
export const MONGODB_VALIDATION_ERROR_NAME = 'ValidationError'

export function logAndThrowMongoError(logger: LogstashCapableLogger, error) {
  const msg = 'Unable to save data'
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

export function appendStaticId<T>(rdRequest: T): IHasStaticId {
  return {
    ...rdRequest,
    staticId: uuid4()
  }
}

export const toObject = (document: Mongoose.Document) => {
  return document ? document.toObject() : null
}

export const toObjects = (documents: Mongoose.Document[]) => {
  const objects = documents.map(model => {
    return model.toObject()
  })
  return objects
}
