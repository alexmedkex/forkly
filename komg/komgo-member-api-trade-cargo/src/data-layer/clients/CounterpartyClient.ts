import axios, { AxiosInstance } from 'axios'
import * as AxiosError from 'axios-error'
import { getLogger } from '@komgo/logging'
import { ICounterpartyClient } from './ICounterpartyClient'
import { injectable } from 'inversify'
import { axiosRetry, exponentialDelay } from '../../retry'
import * as config from 'config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'

const API_CONTERPARTY_BASE_URL: string = config.get('coverage.url')

@injectable()
export class CounterpartyClient implements ICounterpartyClient {
  http: AxiosInstance
  private readonly retryDelay = 1000
  private readonly logger = getLogger('CounterpartyClient')

  constructor({ baseURL = API_CONTERPARTY_BASE_URL, ...options } = {}) {
    this.http = axios.create({
      baseURL,
      ...options
    })
  }

  async autoAdd(companyIds: string[]): Promise<void> {
    try {
      this.logger.info('Counterparty auto add', { companyIds })
      await axiosRetry(
        async () => this.http.post(`/v0/counterparties/add/auto`, { companyIds }),
        exponentialDelay(this.retryDelay)
      )
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.HttpRequestFailed,
        'Error calling the Counterparty API with code: %s. Response:',
        axiosError.message,
        this.getErrorResponse(axiosError)
      )
      // throw new Error(`Failed to get company data. ${error.message}`)
    }
  }

  private getErrorResponse(error: AxiosError): any {
    if (error.response) return error.response.data
    return '<none>'
  }
}
