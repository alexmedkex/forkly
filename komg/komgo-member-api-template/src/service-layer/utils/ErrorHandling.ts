import { QueryFilterException } from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'

import { DatabaseConnectionException, ErrorNames, ContentNotFoundException } from '../../exceptions'

import { ValidationError } from './validationErrors'

const badRequest = e => {
  return ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, e.message, e.data || null)
}

const logger = getLogger('ErrorHandling')

export function generateHttpException(e: any) {
  switch (e.constructor) {
    case ValidationError:
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationInvalidOperation, e.message, e.errors)
    case ContentNotFoundException:
      return ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, e.message)
    case DatabaseConnectionException:
      return ErrorUtils.internalServerException(ErrorCode.ConnectionDatabase)
    case QueryFilterException:
      return badRequest(e)
    case HttpException:
      throw e
    default:
      logger.error(ErrorCode.UnexpectedError, ErrorNames.UnexpectedError, e.message, { stackTrace: e.stack })
      return ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}
