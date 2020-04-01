import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { AxiosInstance } from 'axios'
import { injectable, inject } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'

import CompanyRegistryError from './CompanyRegistryError'

const namehash = require('eth-ens-namehash')

@injectable()
export default class CompanyRegistryClient {
  private readonly logger = getLogger('CompanyRegistryClient')
  private readonly apiRegistryUrl: string

  constructor(
    @inject(VALUES.ApiRegistryBaseURL) apiRegistryBaseURL: string,
    @inject(TYPES.AxiosInstance) private readonly axios: AxiosInstance
  ) {
    this.apiRegistryUrl = apiRegistryBaseURL + '/v0/'
  }

  async getEntryFromStaticId(staticId: string): Promise<any> {
    try {
      const domain = `${staticId}.meta.komgo`
      const node = namehash.hash(domain)
      const query = `{"node" : "${node}" }`

      const response = await this.doRequest(query)
      this.logger.info('Getting Entry from staticId', { query, staticId })
      if (!response || !response.data || response.data.length === 0) {
        this.logger.crit(ErrorCode.Configuration, ErrorName.CompanyRegistryNoEntryFromStaticId, {
          query,
          domain,
          node,
          staticId
        })
        return null
      }
      return response.data[0]
    } catch (error) {
      this.logger.warn(ErrorCode.ConnectionMicroservice, ErrorName.CompanyRegistryRequestFailed, error.response)
      throw new CompanyRegistryError('Error getting company details')
    }
  }

  private async doRequest(query: string): Promise<any> {
    return this.axios.get(`${this.apiRegistryUrl}registry/cache/?companyData=${encodeURIComponent(query)}`)
  }
}
