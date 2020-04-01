import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import * as AxiosError from 'axios-error'
import { injectable, inject } from 'inversify'

import { CONFIG } from '../../inversify/config'
import { axiosRetry, exponentialDelay } from '../../retry'
import { ErrorName } from '../../utils/Constants'

import { ICompany } from './ICompany'
import { ICompanyClient } from './ICompanyClient'

@injectable()
export class CompanyClient implements ICompanyClient {
  private readonly logger = getLogger('CompanyClient')

  constructor(
    @inject(CONFIG.RegistryUrl) private readonly registryServiceUrl: string,
    private readonly retryDelay = 1000
  ) {}

  async getCompanies(query: any): Promise<ICompany[]> {
    const data = await this.getCompanyData(query)
    return data.map(x => this.mapCompanyData(x))
  }

  async getCompanyByStaticId(staticId: string): Promise<ICompany> {
    const companies = await this.getCompanies({ staticId })

    return companies && companies.length ? companies[0] : null
  }

  private async getCompanyData(query: any): Promise<ICompany[]> {
    const params = JSON.stringify(query)

    try {
      this.logger.info('Retrieving company data')

      const response = await axiosRetry(
        async () => axios.get<any[]>(`${this.registryServiceUrl}/v0/registry/cache?companyData=${params}`),
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
      throw new Error(`Failed to get company data. ${error.message}`)
    }
  }

  private getResponse(error: AxiosError): any {
    if (error.response) return error.response.data
    return '<none>'
  }

  private mapCompanyData(data: any): ICompany {
    const { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name, komgoMnid } = data
    return { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name, komgoMnid }
  }
}
