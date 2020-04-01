import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { AxiosInstance, AxiosRequestConfig } from 'axios'

import { ErrorName } from '../../../ErrorName'
import { MicroserviceClientError } from '../../errors'

export async function executeGetRequest(
  logger: LogstashCapableLogger,
  axios: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
) {
  try {
    return await axios.get(url, config)
  } catch (error) {
    logger.error(ErrorCode.ConnectionMicroservice, ErrorName.ClientGetRequestFailed, 'Error executing GET request', {
      error: error.message
    })

    throw new MicroserviceClientError(error.message)
  }
}

export async function executePostRequest(logger: LogstashCapableLogger, axios: AxiosInstance, url: string, data: any) {
  try {
    return await axios.post(url, data)
  } catch (error) {
    logger.error(ErrorCode.ConnectionMicroservice, ErrorName.ClientPostRequestFailed, 'Error executing POST request', {
      error: error.message
    })

    throw new MicroserviceClientError(error.message)
  }
}
