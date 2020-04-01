import { HttpException, ErrorUtils } from '@komgo/microservice-config'
import { Body, Controller, Get, Post, Route, Security, SuccessResponse, Tags, Query, Response } from 'tsoa'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ICounterparty, ICounterpartyRequest } from '../responses/ICounterparty'
import { ICounterpartyService } from '../../business-layer/counterparty/ICounterpartyService'
import IAddCounterpartiesRequest from '../request/IAddCounterpartiesRequest'
import { HttpServerMessages } from '../utils/HttpConstants'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import logger from '@komgo/logging'
import { CompanyRequest } from '../request/CompanyRequest'
import { validateMongoFilter } from '@komgo/data-access'
/**
 * CounterpartyController
 * @export
 * @class CounterpartyController
 * @extends {Controller}
 */
@Tags('counterparties')
@Route('counterparties')
@provideSingleton(CounterpartyController)
export class CounterpartyController extends Controller {
  constructor(@inject(TYPES.CounterpartyService) private readonly counterpartyService: ICounterpartyService) {
    super()
  }

  /**
   * Get counterparty request by requestId. If request with provided id doesn't exist not found exception will be returned.
   *
   * @summary Get counterparty request by id
   *
   * @param {string} query query
   *
   * @returns {ICounterpartyRequest} object of counterparty request with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'read'])
  @Get('requests/{requestId}')
  @SuccessResponse('200', 'Requested')
  public async getRequest(requestId: string): Promise<ICounterpartyRequest> {
    return this.counterpartyService.getCounterpartyRequest(requestId)
  }

  /**
   * Add counterparty list based on provided companyIds (companies staticId) provided. If company doesn't exist from this proveded list that company will not be added but exception will not be rased.
   *
   * @summary Automatically register companies as counterparties, without sending requests
   *
   * @param {IAddCounterpartiesRequest} req add counterparty request list
   *
   * @returns {void} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'crud'])
  @Post('add')
  @SuccessResponse('200', 'ListAdded')
  public async addList(@Body() req: IAddCounterpartiesRequest): Promise<void> {
    return this.counterpartyService.addCounterpartyList(req.companyIds)
  }

  /**
   * Internal method for auto adding counterparties
   *
   * @summary Add counterparty list based on provided companyIds (companies staticId)
   *
   * @param {IAddCounterpartiesRequest} req add counterparty request list
   *
   * @returns {void} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Post('add/auto')
  @SuccessResponse('200', 'AutoAdded')
  public async autoAddList(@Body() req: IAddCounterpartiesRequest): Promise<void> {
    return this.counterpartyService.autoAddCountepartyList(req.companyIds)
  }

  /**
   * Counterparty request will be sent to other company
   *
   * @summary Add counterparty
   *
   * @param {string} companyid company staticId
   *
   * @returns {void} with status code 201
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'crud'])
  @SuccessResponse('201', 'Created')
  @Post('{companyid}/add')
  public async add(companyid: string): Promise<void> {
    return this.counterpartyService.addCounterparty(companyid)
  }

  /**
   * Resend counterparty request by company staticId.
   *
   * @summary Resend counterparty request
   *
   * @param {string} companyid company staticId
   *
   * @returns {void} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'crud'])
  @SuccessResponse('200', 'Resend')
  @Post('{companyid}/resend')
  public async resend(companyid: string): Promise<void> {
    return this.counterpartyService.resendCounterparty(companyid)
  }

  /**
   * Get all counterparties with possibilities to provide filter via query param
   *
   * @summary Get all counterparties
   *
   * @param {string} queryParams to filter counterparties
   *
   * @returns {ICounterparty[]} list of counterties with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('signedIn')
  @SuccessResponse('200', 'Counterperties')
  @Get()
  public async find(@Query('query') queryParams: string): Promise<ICounterparty[]> {
    let filter
    try {
      filter = queryParams ? JSON.parse(queryParams) : {}
      await validateMongoFilter(filter, CompanyRequest, { node: ['$in'] })
    } catch (err) {
      logger.error(ErrorCode.ValidationHttpContent, ErrorName.ParseQueryStringFailed, err)
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, 'Invalid query object', err.data || null)
    }

    return this.counterpartyService.getCounterparties(filter)
  }

  /**
   * Get all counterparties with requests and with possibilities to provide filter via query param
   *
   * @summary Get all counterparties with all requests
   *
   * @param {string} queryParams to filter counterparties
   *
   * @returns {ICounterparty[]} list of counterties with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('signedIn')
  @SuccessResponse('200', 'Counterperties')
  @Get('all')
  public async findAll(@Query('query') queryParams: string): Promise<ICounterparty[]> {
    let filter
    try {
      filter = queryParams ? JSON.parse(queryParams) : {}
      await validateMongoFilter(filter, CompanyRequest, { node: ['$in'] })
    } catch (err) {
      logger.error(ErrorCode.ValidationHttpContent, ErrorName.ParseQueryStringFailed, err)
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, 'Invalid query object', err.data || null)
    }

    return this.counterpartyService.getConnectedCounterpartiesWithRequests(filter)
  }

  /**
   * Approve counterparty request
   *
   * @summary Approve counterparty request that company has sent
   *
   * @param {string} companyid Company staticId
   *
   * @returns {void} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'crud'])
  @SuccessResponse('200', 'Approved')
  @Post('{companyid}/approve')
  public async approve(companyid: string): Promise<void> {
    await this.counterpartyService.approveCounterparty(companyid)
  }

  /**
   * Reject counterparty request
   *
   * @summary reject counterparty request that company has sent
   *
   * @param {string} companyid Company staticId
   *
   * @returns {void} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['coverage', 'manageCoverage', 'crud'])
  @SuccessResponse('200', 'Rejected')
  @Post('{companyid}/reject')
  public async reject(companyid: string): Promise<void> {
    await this.counterpartyService.rejectCounterparty(companyid)
  }
}
