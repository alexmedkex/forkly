import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { ICompany } from '@komgo/types'
import axios from 'axios'
import { injectable, inject } from 'inversify'

import { TYPES } from '../../inversify/types'

export interface ICompanyRegistryService {
  getCompany(staticId: string): Promise<ICompany>
  getCompanyName(staticId: string): Promise<string>
}

@injectable()
export default class CompanyRegistryService implements ICompanyRegistryService {
  private logger = getLogger('CompanyRegistryService')

  constructor(@inject(TYPES.ApiRegistryUrl) private readonly apiRegistryUrl: string) {}

  async getCompany(staticId: string): Promise<ICompany> {
    let response
    try {
      response = await axios.get<ICompany[]>(
        `${this.apiRegistryUrl}/v0/registry/cache/?companyData=${encodeURIComponent(JSON.stringify({ staticId }))}`
      )
    } catch (e) {
      throw ErrorUtils.internalServerException(
        ErrorCode.ConnectionMicroservice,
        `Failed to get company ${staticId} in the registry cache`
      )
    }

    this.logger.debug(`Found ${response.data.length} companies that match staticId=${staticId}`)
    if (!response.data.length) {
      throw ErrorUtils.notFoundException(
        ErrorCode.ValidationHttpContent,
        `Company with staticId ${staticId} not found in the registry cache`
      )
    }

    return response.data[0]
  }

  async getCompanyName(staticId: string): Promise<string> {
    return (await this.getCompany(staticId)).x500Name.O
  }

  async getAllCompanies(): Promise<ICompany[]> {
    let response
    try {
      response = await axios.get<ICompany[]>(
        `${this.apiRegistryUrl}/v0/registry/cache/?companyData=${encodeURIComponent('{}')}`
      )
    } catch (e) {
      throw ErrorUtils.internalServerException(
        ErrorCode.ConnectionMicroservice,
        `Failed to get company records in the registry cache`
      )
    }

    this.logger.debug(`Found ${response.data.length} companies`)
    if (!response.data.length) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, `Companies not found in the registry cache`)
    }

    return response.data.filter(item => Object.keys(item).indexOf('staticId') > 0 && item.staticId.length > 0)
  }
}
