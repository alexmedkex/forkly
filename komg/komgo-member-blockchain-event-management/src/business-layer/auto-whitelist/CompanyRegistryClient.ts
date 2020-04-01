import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance } from 'axios'
import { injectable, inject } from 'inversify'

import { VALUES } from '../../inversify/values'
import { RequestIdHandler } from '../../util/RequestIdHandler'
import { CompanyRegistryError } from '../errors'

const JSON_MIME_TYPE = 'application/json;charset=utf-8'

@injectable()
export class CompanyRegistryClient {
  private readonly logger = getLogger('CompanyRegistryClient')
  private readonly axios: AxiosInstance

  constructor(
    @inject(VALUES.ApiRegistryBaseURL) apiRegistryBaseURL: string,
    @inject(VALUES.RequestIdHandler) requestIdHandler: RequestIdHandler
  ) {
    this.axios = Axios.create({
      baseURL: `${apiRegistryBaseURL}/v0`,
      headers: { 'Content-Type': JSON_MIME_TYPE }
    })
    requestIdHandler.addToAxios(this.axios)
    this.logger.addLoggingToAxios(this.axios)
  }

  /**
   * Gets contract address from API Registry
   *
   * @param node ENS node -> ENS domain hash (using Namehash algorithm)
   *
   * @returns contract address for node
   */
  public async getContractAddress(node: string): Promise<string> {
    const query = `{"node" : "${node}" }`

    try {
      const response = await this.axios.get(`registry/cache/?companyData=${encodeURIComponent(query)}`)

      if (!response.data || response.data.length === 0 || !response.data[0].address) {
        throw new CompanyRegistryError('Invalid response format', response.data)
      }

      return response.data[0].address as string
    } catch (error) {
      throw new CompanyRegistryError(error.message)
    }
  }
}
