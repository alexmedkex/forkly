import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { AxiosInstance } from 'axios'
import { hash } from 'eth-ens-namehash'
import { injectable, inject } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { TYPES, VALUES } from '../../inversify'
import { MicroserviceClientError } from '../errors'

import { executeGetRequest, getCompanyName } from './utils'

@injectable()
export class CompanyRegistryClient {
  private readonly logger = getLogger('CompanyRegistryClient')
  private readonly apiRegistryUrl: string

  constructor(
    @inject(VALUES.ApiRegistryBaseURL) apiRegistryBaseURL: string,
    @inject(TYPES.AxiosInstance) private readonly axios: AxiosInstance
  ) {
    this.apiRegistryUrl = apiRegistryBaseURL + '/v0/'
  }

  /**
   * Gets all komgo members status from the company registry
   *
   * @returns Array of all current members static ids
   */
  public async getAllMembersStaticIds(): Promise<string[]> {
    const query = '{"isMember": "true"}'

    const data = await this.getEntries(query)

    return data.map((member: any) => member.staticId)
  }

  /**
   * Gets a company name given a member's staticId
   * @param staticId static id of the member to query
   */
  public async getCompanyNameFromStaticId(staticId: string): Promise<string> {
    const data = await this.getCompanyInfoFromStaticId(staticId)
    return getCompanyName(data, this.logger)
  }

  /**
   * Gets a companys info
   * @param staticId static id of the member to query
   */
  public async getCompanyInfoFromStaticId(staticId: string) {
    const domain = `${staticId}.meta.komgo`
    const node = hash(domain)
    const query = `{"node" : "${node}" }`
    const data = await this.getEntries(query)
    return data[0]
  }

  private async getEntries(query: string) {
    const response = await executeGetRequest(
      this.logger,
      this.axios,
      `${this.apiRegistryUrl}registry/cache/?companyData=${encodeURIComponent(query)}`
    )

    if (!response.data || response.data.length === 0) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.CompanyRegistryClientInvalidResponse,
        'Invalid response returned from company registry',
        { data: response.data }
      )

      throw new MicroserviceClientError('Invalid response format', response.data)
    }

    return response.data
  }
}
