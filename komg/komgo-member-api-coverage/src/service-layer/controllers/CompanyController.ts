import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import logger from '@komgo/logging'
import { Controller, Get, Route, Security, SuccessResponse, Tags, Query, Response } from 'tsoa'
import { ErrorName } from '../../utils/Constants'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ICoverageCompany } from '../../business-layer/registry/ICompany'
import { ICounterpartyService } from '../../business-layer/counterparty/ICounterpartyService'
import { HttpServerMessages } from '../utils/HttpConstants'
import { validateMongoFilter } from '@komgo/data-access'
import { CompanyRequest } from '../request/CompanyRequest'

/**
 * CompanyController Class
 *
 * @export
 * @class CompanyController
 * @extends {Controller}
 */
@Tags('companies')
@Route('companies')
@provideSingleton(CompanyController)
export class CompanyController extends Controller {
  constructor(@inject(TYPES.CounterpartyService) private readonly counterpartyService: ICounterpartyService) {
    super()
  }

  /**
   * Get all not covered companies by query
   *
   * @summary Get all not covered companies by query
   *
   * @param {string} query query
   *
   * @returns {ICoverageCompany[]} list of companites with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'crud'])
  @Get('not-covered')
  @SuccessResponse(200, 'NotCovered')
  public async find(@Query('query') query: string): Promise<ICoverageCompany[]> {
    let filter
    try {
      filter = JSON.parse(query)
      await validateMongoFilter(filter, CompanyRequest, { node: ['$in'] })
    } catch (err) {
      logger.error(ErrorCode.ValidationHttpContent, ErrorName.ParseQueryStringFailed, err)
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, 'Invalid query object', err.data || null)
    }

    return this.counterpartyService.getCompanies(filter)
  }
}
