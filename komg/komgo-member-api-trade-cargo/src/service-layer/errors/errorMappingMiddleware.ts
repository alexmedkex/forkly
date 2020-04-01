import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
import { QueryFilterException } from '@komgo/data-access'
import { ErrorUtils } from '@komgo/microservice-config'
import { NextFunction, Request, Response } from 'express'
import { ErrorCode } from '@komgo/error-utilities'

export const errorMappingMiddleware = (err, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next(err)
  }

  if (err instanceof QueryFilterException) {
    const httpError = ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.data)
    return next(httpError || err)
  }

  if (err instanceof DataAccessException) {
    const code = err.error
    let httpError

    switch (code) {
      case DATA_ACCESS_ERROR.NOT_FOUND:
        httpError = ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, err.message)
        break
      case DATA_ACCESS_ERROR.INVALID_DATA:
      case DATA_ACCESS_ERROR.DUPLICATE_KEY:
        httpError = ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.data)
      default:
        break
    }

    return next(httpError || err)
  }

  return next(err)
}
