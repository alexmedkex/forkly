import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance } from 'axios'

// To work with 'import' it requires esModuleInterop:true in tsconfig but
// doing that breaks our config library
const axiosRetry = require('axios-retry')

export const defaultAxiosRetries = 3
export const JSON_MIME_TYPE = 'application/json;charset=utf-8'

/**
 * Returns an Axios instance that uses axios-retry
 * Note it will not retry for 500 responses on idempotent requests such as POSTs
 * @param retryCount
 */
export function createRetryingAxios(retryCount: number = defaultAxiosRetries): AxiosInstance {
  const axiosInstance = Axios.create({
    headers: { 'Content-Type': JSON_MIME_TYPE }
  })
  axiosRetry(axiosInstance, { retries: retryCount, retryDelay: axiosRetry.exponentialDelay })
  getLogger('AxiosLogger').addLoggingToAxios(axiosInstance)
  return axiosInstance
}
