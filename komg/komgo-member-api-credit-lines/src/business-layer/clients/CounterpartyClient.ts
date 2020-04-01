import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import axios, { AxiosInstance } from 'axios'
import * as AxiosError from 'axios-error'
import { injectable, inject } from 'inversify'

import { CONFIG } from '../../inversify/config'
import { axiosRetry, exponentialDelay } from '../../retry'
import { ErrorName } from '../../utils/Constants'

import { ICompany } from './ICompany'
import { ICounterparty } from './ICounterparty'
import { ICounterpartyClient } from './ICounterpartyClient'

@injectable()
export class CounterpartyClient implements ICounterpartyClient {
  http: AxiosInstance
  private readonly retryDelay = 1000
  private readonly logger = getLogger('CounterpartyClient')

  constructor(@inject(CONFIG.CounterpartyUrl) private readonly counterpartyServiceUrl: string, { ...options } = {}) {
    this.http = axios.create({
      ...options
    })
  }

  async getCounterparties(query = {}): Promise<ICounterparty[]> {
    const params = { ...query }
    const data = await this.getCounterpartyData(params)
    return data.map(x => this.mapCounterpartyData(x))
  }

  private async getCounterpartyData(query: any): Promise<ICompany[]> {
    query = { ...query }
    const params = JSON.stringify(query)

    try {
      this.logger.info('Retrieving counterparty data')

      const response = await axiosRetry(
        async () => axios.get<any[]>(`${this.counterpartyServiceUrl}/v0/counterparties?query=${params}`),
        exponentialDelay(this.retryDelay)
      )
      return response.data ? response.data : []
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.Connection,
        ErrorName.HttpRequestFailed,
        axiosError.message,
        this.getResponse(axiosError)
      )
      throw new Error(`Failed to get counterparty data. ${error.message}`)
    }
  }

  private getResponse(error: AxiosError): any {
    if (error.response) return error.response.data
    return '<none>'
  }

  private mapCounterpartyData(data: any): ICounterparty {
    const { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name, covered, status } = data
    return { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name, covered, status }
  }
}
