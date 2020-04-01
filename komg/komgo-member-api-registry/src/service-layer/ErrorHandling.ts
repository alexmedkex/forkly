import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'

import {
  BlockchainConnectionException,
  BlockchainTransactionException,
  DatabaseConnectionException,
  ContentNotFoundException,
  QueryFilterException
} from '../exceptions'
import CacheNotReadyException from '../exceptions/CacheNotReadyException'
import { ErrorNames } from '../exceptions/utils'
import { Metric } from '../utils/Metrics'

const logger = getLogger('ErrorHandling')

const badRequest = e => {
  return ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, e.message, e.data || null)
}

export function generateHttpException(e: Error) {
  switch (e.constructor) {
    case BlockchainTransactionException:
      logger.metric({
        [Metric.Error]: ErrorCode.BlockchainTransaction
      })
      return ErrorUtils.internalServerException(ErrorCode.BlockchainTransaction)
    case BlockchainConnectionException:
      logger.metric({
        [Metric.Error]: ErrorCode.BlockchainConnection
      })
      return ErrorUtils.internalServerException(ErrorCode.BlockchainConnection)
    case DatabaseConnectionException:
      logger.metric({
        [Metric.Error]: ErrorCode.ConnectionDatabase
      })
      return ErrorUtils.internalServerException(ErrorCode.ConnectionDatabase)
    case ContentNotFoundException:
      logger.metric({
        [Metric.Error]: ErrorCode.DatabaseMissingData
      })
      return ErrorUtils.noContentException(ErrorCode.DatabaseMissingData, e.message)
    case QueryFilterException:
      logger.metric({
        [Metric.Error]: ErrorCode.ValidationHttpContent
      })
      return badRequest(e)
    case CacheNotReadyException:
      logger.metric({
        [Metric.Error]: ErrorCode.DatabaseMissingData
      })
      logger.error(ErrorCode.DatabaseMissingData, ErrorNames.CacheNotReadyError, e.message)
      return ErrorUtils.serviceUnavailableException(ErrorCode.DatabaseMissingData, e.message)
    default:
      logger.metric({
        [Metric.Error]: ErrorCode.UnexpectedError
      })
      logger.error(ErrorCode.UnexpectedError, ErrorNames.UnexpectedError, e.message, e.stack)
      return ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}
