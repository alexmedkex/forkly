import axios from 'axios'
import * as AxiosError from 'axios-error'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { axiosRetry, exponentialDelay } from '../../retry'
import { ICompanyClient } from './ICompanyClient'
import { ICoverageCompany } from './ICompany'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'

@injectable()
export class CompanyClient implements ICompanyClient {
  private readonly logger = getLogger('CompanyClient')

  constructor(
    @inject('api-registry-url') private readonly registryServerUrl: string,
    private readonly retryDelay = 1000
  ) {}

  async getCompanies(query: any): Promise<ICoverageCompany[]> {
    const data = await this.getCompanyData(query)
    return data.map(x => this.mapCompanyData(x))
  }

  async getCompanyByStaticId(staticId: string): Promise<ICoverageCompany> {
    const companies = await this.getCompanies({ staticId })

    return companies && companies.length ? companies[0] : null
  }

  private async getCompanyData(query: any): Promise<ICoverageCompany[]> {
    query = { ...query, isMember: true }
    const params = JSON.stringify(query)

    try {
      this.logger.info('Retrieving company data')

      const response = await axiosRetry(
        async () => axios.get<any[]>(`${this.registryServerUrl}/v0/registry/cache?companyData=${params}`),
        exponentialDelay(this.retryDelay)
      )
      return response.data ? response.data : []
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.Connection,
        ErrorName.HttpRegistryApiFailed,
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

  private mapCompanyData(data: any): ICoverageCompany {
    const { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name, komgoMnid } = data
    return { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name, komgoMnid }
  }
}
