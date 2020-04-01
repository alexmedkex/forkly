import { ErrorCode } from '@komgo/error-utilities'

import { ErrorName } from '../../utils/Constants'
import InvalidDataError from '../errors/InvalidDataError'
import { MicroserviceClientError } from '../errors/MicroserviceClientError'

export const processServiceError = (error, action: string, logger) => {
  let errorData = { data: null, statusCode: null }
  let statusCode
  if (error.isAxiosError) {
    statusCode = error.response.status
    errorData = { data: error.response ? error.response.data : null, statusCode: error.response.status }
  }

  logger.error(ErrorCode.ConnectionMicroservice, ErrorName.MessageProcessFailed, {
    err: error.message,
    errorObject: errorData
  })

  if (statusCode >= 400 && statusCode < 500) {
    throw new InvalidDataError(`Failed to:  ${action}: ${error.message}`, errorData.data)
  }

  throw new MicroserviceClientError(error.message, errorData)
}
