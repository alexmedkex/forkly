import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'

import {
  EntityNotFoundError,
  MicroserviceClientError,
  ValidationFieldError,
  ValidationDuplicateError,
  OutboundPublisherError
} from '../../../business-layer/errors'
import { DataLayerError } from '../../../data-layer/errors'
import { ErrorName } from '../../../ErrorName'

export const mapAndThrowHttpException = (logger: LogstashCapableLogger, error: any) => {
  if (error instanceof ValidationFieldError) {
    throw ErrorUtils.unprocessableEntityException(
      ErrorCode.ValidationInvalidOperation,
      error.message,
      error.validationErrors
    )
  } else if (error instanceof ValidationDuplicateError) {
    throw ErrorUtils.conflictException(ErrorCode.DatabaseInvalidData, error.message)
  } else if (error instanceof EntityNotFoundError) {
    throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, error.message)
  } else if (error instanceof MicroserviceClientError) {
    throw ErrorUtils.internalServerException(ErrorCode.ConnectionMicroservice)
  } else if (error instanceof DataLayerError) {
    throw ErrorUtils.internalServerException(error.errorCode)
  } else if (error instanceof OutboundPublisherError) {
    throw ErrorUtils.internalServerException(ErrorCode.ConnectionInternalMQ)
  } else {
    logger.error(ErrorCode.UnexpectedError, ErrorName.UnexpectedError, 'Unexpected error', {
      error: error.message
    })
    throw ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}
