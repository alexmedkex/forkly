import { QueryFilterException } from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { NextFunction, Request, Response } from 'express'

import { ValidationError } from '../../business-layer/errors/ValidationError'
import { NotificationException } from '../../business-layer/notifications/NotificationException'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'

const dataAccessErrorMappingMiddleware = (err: any) => {
  const code = err.error
  if (code === DATA_ACCESS_ERROR.NOT_FOUND) {
    return ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, err.message)
  } else if (code === DATA_ACCESS_ERROR.INVALID_DATA || code === DATA_ACCESS_ERROR.DUPLICATE_KEY) {
    return ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.data)
  } else {
    return ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}

export const errorMappingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next(err)
  }

  let httpError
  if (err instanceof ValidationError) {
    httpError = ErrorUtils.badRequestException(err.errorCode, err.message, err.validationErrors)
    return next(httpError || err)
  }

  if (err instanceof QueryFilterException) {
    httpError = ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.data)
    return next(httpError || err)
  }

  if (err instanceof DataAccessException) {
    httpError = dataAccessErrorMappingMiddleware(err)
  }

  if (err instanceof NotificationException) {
    httpError = ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.validationErrors)
  }

  return next(httpError || err)
}
