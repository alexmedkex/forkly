import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import * as namehash from 'eth-ens-namehash'
import { inject, injectable } from 'inversify'

import { ErrorName } from '../../utils/ErrorName'

import { ICompanyInformation } from './ICompanyInformation'
import RegistryError from './RegistryError'

/**
 * A client to get company information from api-registry.
 */
@injectable()
export class CompaniesRegistryClient {
  private readonly logger = getLogger('CompaniesRegistryClient')

  constructor(@inject('api-registry-url') private readonly registryServerUrl: string) {}

  /**
   * Returns company name by its static id.
   *
   * @param staticId static of a company for which to get a name
   * @returns name of the company with the specified id
   * @throws RegistryError if failed to get company information
   */
  async getCompanyNameByStaticId(staticId: string): Promise<string> {
    const companyInfo = await this.getCompanyInfoById(staticId)
    return companyInfo.x500Name.CN
  }

  /**
   * Get company domain id that can be used to route send RabbitMQ messages to a company.
   * @param staticId company id
   * @returns company information for a company with the provided static id
   * @throws RegistryError if failed to get company information
   */
  async getCompanyInfoById(staticId: string): Promise<ICompanyInformation> {
    const response = await this.getCompanyInfo(staticId)

    if (!response.data || response.data.length === 0) {
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.CompanyInfoNotFoundError, 'No company info found', {
        staticId,
        apiRegistryData: response.data
      })
      throw new RegistryError(`api-registry returned no data for company ${staticId}`)
    }
    return response.data[0]
  }

  private async getCompanyInfo(staticId: string): Promise<any> {
    this.logger.info('Resolving company information for company %s', staticId)
    const url = this.getCompanyFetchUrl(staticId)

    try {
      this.logger.debug(`Fetching company information from '%s'`, url)
      const response = await axios.get(url)
      this.logger.info('Received company information for company %s is:', staticId, response.data)
      return response
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.GenericRegistryError,
        'Error thrown on getCompanyInfo',
        { staticId, errorMessage: error.message }
      )
      throw new RegistryError(`Request to api-registry failed for company ${staticId}`)
    }
  }

  private getCompanyFetchUrl(staticId: string) {
    const domain = `${staticId}.meta.komgo`
    const node = namehash.hash(domain)
    const query = `{"node" : "${node}" }`

    return `${this.registryServerUrl}/v0/registry/cache?companyData=${encodeURIComponent(query)}`
  }
}
