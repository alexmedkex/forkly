import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { getLogger } from '@komgo/logging'
import { QueryFilterException } from '@komgo/data-access'
import {
  MicroserviceConnectionException,
  ConflictError,
  ContentNotFoundException,
  DatabaseConnectionException,
  InvalidDatabaseDataException,
  InvalidMessageException,
  InvalidOperationException,
  InvalidDocumentException,
  DuplicateDocumentException
} from '../../exceptions'
import BlockchainConnectionException from '../../exceptions/BlockchainConnectionException'
import BlockchainTransactionException from '../../exceptions/BlockchainTransactionException'
import MissingEventProcessor from '../../exceptions/MissingEventProcessor'
import { ErrorNames } from '../../exceptions/utils'
import { Metric } from '../../utils/Metrics'
import { ValidationError } from '../../data-layer/data-agents/utils'

const badRequest = e => {
  return ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, e.message, e.data || null)
}

const logger = getLogger('ErrorHandling')

export function generateHttpException(e: any) {
  switch (e.constructor) {
    case MicroserviceConnectionException:
      logger.metric({
        [Metric.Error]: ErrorCode.ConnectionMicroservice
      })
      return ErrorUtils.internalServerException(ErrorCode.ConnectionMicroservice)
    case BlockchainConnectionException:
      logger.metric({
        [Metric.Error]: ErrorCode.BlockchainConnection
      })
      return ErrorUtils.internalServerException(ErrorCode.BlockchainConnection)
    case BlockchainTransactionException:
      logger.metric({
        [Metric.Error]: ErrorCode.BlockchainTransaction
      })
      return ErrorUtils.internalServerException(ErrorCode.BlockchainTransaction)
    case ConflictError:
      logger.metric({
        [Metric.Error]: ErrorCode.ValidationHttpContent
      })
      return ErrorUtils.conflictException(ErrorCode.ValidationHttpContent, e.message)
    case ContentNotFoundException:
      logger.metric({
        [Metric.Error]: ErrorCode.DatabaseMissingData
      })
      return ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, e.message)
    case InvalidDocumentException:
      logger.metric({
        [Metric.Error]: ErrorCode.DatabaseMissingData
      })
      return ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, e.message)
    case DuplicateDocumentException:
      logger.metric({
        [Metric.Error]: ErrorCode.DatabaseInvalidData
      })
      return ErrorUtils.conflictException(ErrorCode.DatabaseInvalidData, e.message)
    case DatabaseConnectionException:
      logger.metric({
        [Metric.Error]: ErrorCode.ConnectionDatabase
      })
      return ErrorUtils.internalServerException(ErrorCode.ConnectionDatabase)
    case InvalidDatabaseDataException:
      logger.metric({
        [Metric.Error]: ErrorCode.DatabaseInvalidData
      })
      return ErrorUtils.conflictException(ErrorCode.DatabaseInvalidData, e.message)
    case InvalidMessageException:
      logger.metric({
        [Metric.Error]: ErrorCode.BlockchainEventValidation
      })
      return ErrorUtils.internalServerException(ErrorCode.BlockchainEventValidation)
    case InvalidOperationException:
      logger.metric({
        [Metric.Error]: ErrorCode.ValidationHttpContent
      })
      return ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, e.message)
    case ValidationError:
      logger.metric({
        [Metric.Error]: ErrorCode.ValidationHttpSchema
      })
      if (e.errors) {
        return ErrorUtils.unprocessableEntityException(ErrorCode.ValidationInvalidOperation, e.message, e.errors)
      } else {
        return ErrorUtils.unprocessableEntityException(ErrorCode.ValidationInvalidOperation, e.message)
      }
    case MissingEventProcessor:
      logger.metric({
        [Metric.Error]: ErrorCode.BlockchainEventValidation
      })
      return ErrorUtils.internalServerException(ErrorCode.BlockchainEventValidation)
    case QueryFilterException:
      logger.metric({
        [Metric.Error]: ErrorCode.ValidationHttpContent
      })
      return badRequest(e)
    default:
      logger.metric({
        [Metric.Error]: ErrorCode.UnexpectedError
      })
      logger.error(ErrorCode.UnexpectedError, ErrorNames.UnexpectedError, e.message, e.stack)
      return ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}
