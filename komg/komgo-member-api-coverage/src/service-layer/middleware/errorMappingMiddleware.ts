import { NextFunction, Request, Response } from 'express'
import { CounterpartyError } from '../../business-layer/errors/CounterpartyError'
import { COUNTERPARTY_ERROR_CODE } from '../../business-layer/errors/CounterpartyErrorCode'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

const counterpartyErrorMappingMiddleware = (err: any) => {
  if (
    err.errorCode === COUNTERPARTY_ERROR_CODE.REQUEST_NOT_FOUND ||
    err.errorCode === COUNTERPARTY_ERROR_CODE.INVALID_REQUEST ||
    err.errorCode === COUNTERPARTY_ERROR_CODE.GENERAL_ERROR
  ) {
    return ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.data)
  }

  return null
}

const dataAccessErrorMappingMiddleware = (err: any) => {
  const code = err.error
  if (code === DATA_ACCESS_ERROR.NOT_FOUND) {
    return ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, err.message)
  } else if (code === DATA_ACCESS_ERROR.INVALID_DATA || code === DATA_ACCESS_ERROR.DUPLICATE_KEY) {
    return ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, err.message, err.data)
  }
}

export const errorMappingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next(err)
  }

  let httpError

  if (err instanceof CounterpartyError) {
    httpError = counterpartyErrorMappingMiddleware(err)
  }

  if (err instanceof DataAccessException) {
    httpError = dataAccessErrorMappingMiddleware(err)
  }

  return next(httpError || err)
}
