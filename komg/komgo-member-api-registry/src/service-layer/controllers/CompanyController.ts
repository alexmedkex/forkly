import { getLogger } from '@komgo/logging'
import { Route, Post, Body, Controller, Security } from 'tsoa'

import ICompanyUseCase from '../../business-layer/company/ICompanyUseCase'
import Company from '../../data-layer/models/Company'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { Metric, CompanyControllerEndpoints } from '../../utils/Metrics'
import { generateHttpException } from '../ErrorHandling'
import CreateCompanyRequest from '../requests/CreateCompanyRequest'
import ICreateCompanyResponse from '../responses/ICreateCompanyResponse'

/**
 * CompanyController
 * @export
 * @class CompanyController
 * @extends {Controller}
 */
@Route('registry/company')
@provideSingleton(CompanyController)
export class CompanyController extends Controller {
  private readonly logger = getLogger('CompanyController')

  constructor(@inject(TYPES.CompanyUseCase) private companyUseCase: ICompanyUseCase) {
    super()
  }

  @Security('internal')
  @Post()
  public async createCompany(@Body() companyRequest: CreateCompanyRequest): Promise<ICreateCompanyResponse> {
    this.logger.metric({
      [Metric.APICallReceived]: CompanyControllerEndpoints.CreateCompany
    })
    const company = new Company(companyRequest.companyLabel, companyRequest.companyAddress)
    try {
      const txHash = await this.companyUseCase.createCompany(company)
      this.logger.metric({
        [Metric.APICallFinished]: CompanyControllerEndpoints.CreateCompany
      })
      return { txHash }
    } catch (error) {
      throw generateHttpException(error)
    }
  }
}
