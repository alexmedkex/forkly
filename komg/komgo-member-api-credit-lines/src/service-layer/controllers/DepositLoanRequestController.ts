import { validateMongoFilter } from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { Currency, DepositLoanPeriod, ISaveDepositLoanRequest } from '@komgo/types'
import { Body, Controller, Get, Post, Route, Security, SuccessResponse, Tags, Path, Query, Response } from 'tsoa'

import { IDepositLoanRequestService } from '../../business-layer/deposit-loan/DepositLoanRequestService'
import { IDepositLoanValidationService } from '../../business-layer/deposit-loan/DepositLoanValidationService'
import { IDepositLoanRequestDataAgent } from '../../data-layer/data-agents/IDepositLoanRequestDataAgent'
import { IDepositLoanRequestDocument } from '../../data-layer/models/IDepositLoanRequestDocument'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { DepositLoanFilter } from '../requests/DepositLoanFilter'
import { HttpServerMessages } from '../utils/HttpConstants'

import {
  getDepositLoanType,
  DepositLoanTypeFeature,
  DepositLoanRequestTypeFeature,
  getDepositLoanRequestType
} from './utils'

/**
 * DepositLoanRequest Controller
 * @export
 * @class DepositLoanRequestController
 * @extends {Controller}
 */
@Tags('DepositLoan Request Controller')
@Route('/deposit-loan-requests')
@provideSingleton(DepositLoanRequestController)
export class DepositLoanRequestController extends Controller {
  private readonly logger = getLogger('DepositLoadRequestController')

  constructor(
    @inject(TYPES.DepositLoanRequestDataAgent)
    private readonly depositLoanRequestDataAgent: IDepositLoanRequestDataAgent,
    @inject(TYPES.DepositLoanRequestService) private readonly depositLoanRequestService: IDepositLoanRequestService,
    @inject(TYPES.DepositLoanValidationService)
    private readonly depositLoanValidationService: IDepositLoanValidationService
  ) {
    super()
  }

  /**
   * Create - send new desposit or loan request.
   *
   * @summary Create - send new desposit or loan request.
   *
   * @param {DepositLoanTypeFeature} type deposit or loan
   * @param {ISaveDepositLoanRequest} request Deposit / Loan request data
   * @returns {Promise<string>}
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Post('{type}')
  public async create(
    @Path('type') type: DepositLoanTypeFeature,
    @Body() request: ISaveDepositLoanRequest
  ): Promise<string[]> {
    const depositLoanType = getDepositLoanType(type)

    this.depositLoanValidationService.validateDepositLoanRequest(request)

    this.logger.info(`Creating ${type} request`)

    this.setStatus(201)

    return this.depositLoanRequestService.create(depositLoanType, request)
  }

  /**
   * Return deposit or loan sent request by staticId.
   *
   * @summary Get deposit or loan sent request by staticId.
   * @param {DepositLoanTypeFeature} type is deposit or loan
   * @param {DepositLoanRequestTypeFeature} requestType is requested or received
   * @param {string} id is the staticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Get('{type}/request-type/{requestType}/{id}')
  @SuccessResponse('200')
  public async getById(
    @Path('type') type: DepositLoanTypeFeature,
    @Path('requestType') requestType: DepositLoanRequestTypeFeature,
    @Path('id') id: string
  ): Promise<IDepositLoanRequestDocument> {
    const depositLoanType = getDepositLoanType(type)
    const depositLoanRequestType = getDepositLoanRequestType(requestType)

    this.logger.info(`Fetching ${type} request for ${depositLoanRequestType} by staticId`, {
      id
    })
    const result = await this.depositLoanRequestDataAgent.get(depositLoanType, id)

    if (result.requestType !== depositLoanRequestType) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `Not found ${type} request by staticId`)
    }

    return result
  }

  /**
   * Get all deposit or loan sent request. Deposit or loan sent requests can be filtered by deposit or loan params that are proveded in GET request.
   *
   * @summary Get deposit or loan sent request by filter
   *
   * @param {DepositLoanTypeFeature} type is deposit or loan
   * @param {DepositLoanRequestTypeFeature} requestType is requested or received
   * @param {string} filter Query to filter deposit or loan sent request. Accepts mongo style query
   *
   * @returns {IDepositLoanRequestDocument} list of deposit or loan sent request with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Get('{type}/request-type/{requestType}')
  @SuccessResponse('200')
  public async find(
    @Path('type') type: DepositLoanTypeFeature,
    @Path('requestType') requestType: DepositLoanRequestTypeFeature,
    @Query('query') queryParams?: string
  ): Promise<IDepositLoanRequestDocument[]> {
    const filter = queryParams ? JSON.parse(queryParams) : {}
    await validateMongoFilter(filter, DepositLoanFilter, {})

    const depositLoanType = getDepositLoanType(type)
    const depositLoanRequestType = getDepositLoanRequestType(requestType)

    this.logger.info(`Fetching all ${type} request for ${requestType} by filter`, {
      filter
    })

    return this.depositLoanRequestDataAgent.find({
      ...filter,
      type: depositLoanType,
      requestType: depositLoanRequestType
    })
  }

  /**
   * Return deposit or loan sent request by currency, period and period duration.
   *
   * @summary Get deposit or loan sent request by currency, period and period duration.
   *
   * @param {DepositLoanTypeFeature} type is deposit or loan
   * @param {currency} currency is the Currency
   * @param {period} counterpartyStaticId is the DepositLoanPeriod
   * @param {periodDuration} periodDuration is the number
   * @param {DepositLoanRequestTypeFeature} requestType is requested or received
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Get('{type}/currency/{currency}/period/{period}/period-duration/{periodDuration}/request-type/{requestType}')
  @SuccessResponse('200')
  public async getByCurrencyPeriod(
    @Path('type') type: DepositLoanTypeFeature,
    @Path('currency') currency: Currency,
    @Path('period') period: DepositLoanPeriod,
    @Path('periodDuration') periodDuration: number,
    @Path('requestType') requestType: DepositLoanRequestTypeFeature
  ): Promise<IDepositLoanRequestDocument[]> {
    this.logger.info(`Fetching ${type} requests by currency, period and period duration`, {
      currency,
      period,
      periodDuration
    })

    const depositLoanType = getDepositLoanType(type)
    const depositLoanRequestType = getDepositLoanRequestType(requestType)

    return this.depositLoanRequestDataAgent.find({
      type: depositLoanType,
      currency,
      period,
      periodDuration,
      requestType: depositLoanRequestType
    })
  }

  /**
   * Decline pending received equests for counterparty
   *
   * @summary Decline requests for  specific product/subproduct
   *
   * @param {DepositLoanTypeFeature} type is deposit or loan
   * @param {currency} currency is the Currency
   * @param {period} counterpartyStaticId is the DepositLoanPeriod
   * @param {periodDuration} periodDuration is the number
   * @param {string[]} requestIds is the counterpartyStaticId
   *
   * @returns {ICreditLine} list of credit line received request with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Post('{type}/decline')
  @SuccessResponse('200', 'Requests sucessfully declined')
  public async declinePendingRequests(
    @Path('type') type: DepositLoanTypeFeature,
    @Body() requestIds: string[]
  ): Promise<void> {
    this.logger.info('Decline pending requests', {
      type,
      requestIds
    })

    const depositLoanType = getDepositLoanType(type)

    await this.depositLoanRequestService.closeAllPendingRequestsByRequestIds(depositLoanType, requestIds)
  }
}
