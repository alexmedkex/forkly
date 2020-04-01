import { validateMongoFilter } from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { IDisclosedDepositLoan, IDisclosedDepositLoanSummary } from '@komgo/types'
import { Controller, Route, Tags, Response, Security, Get, SuccessResponse, Path, Query } from 'tsoa'

import { IDisclosedDepositLoanDataAgent } from '../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { DepositLoanFilter } from '../requests/DepositLoanFilter'
import { HttpServerMessages } from '../utils/HttpConstants'

import { getDepositLoanType, DepositLoanTypeFeature } from './utils'

/**
 * DisclosedDepositLoan Controller
 * @export
 * @class DisclosedDepositLoanController
 * @extends {Controller}
 */
@Tags('DisclosedDepositLoanController')
@Route('/disclosed-deposit-loans')
@provideSingleton(DisclosedDepositLoanController)
export class DisclosedDepositLoanController extends Controller {
  private readonly logger = getLogger('DisclosedDepositLoanController')

  constructor(
    @inject(TYPES.DisclosedDepositLoanDataAgent) private disclosedDepositLoanDataAgent: IDisclosedDepositLoanDataAgent
  ) {
    super()
  }

  /**
   * Return disclosed deposit loan by staticId.
   *
   * @summary Get disclosed deposit loan by staticId.
   *
   * @param {string} type feature type loan / deposit
   * @param {string} id is the staticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Get('{type}/{staticId}')
  @SuccessResponse('200', 'GET')
  public async getById(
    @Path('type') type: DepositLoanTypeFeature,
    @Path('staticId') staticId: string
  ): Promise<IDisclosedDepositLoan> {
    this.logger.info('Fetching disclosed deposit loan by staticId', {
      staticId
    })
    const depositLoanType = getDepositLoanType(type)

    return this.disclosedDepositLoanDataAgent.findOne(depositLoanType, { staticId })
  }

  /**
   * Get all disclosed deposit loans. Disclosed deposit loans can be filtered by deposit loan params that are proveded in GET request.
   *
   * @summary Get disclosed deposit loans by filter
   *
   * @param {string} type feature type loan / deposit
   *
   * @returns {IDisclosedDepositLoan} list of disclosed deposit loans with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Get('{type}')
  @SuccessResponse('200', 'GET')
  public async find(
    @Path('type') type: DepositLoanTypeFeature,
    @Query('query') queryParams?: string
  ): Promise<IDisclosedDepositLoan[]> {
    const filter = queryParams ? JSON.parse(queryParams) : {}
    const depositLoanType = getDepositLoanType(type)
    await validateMongoFilter(filter, DepositLoanFilter, {})
    this.logger.info('Fetching all disclosed deposit loans by filter', {
      filter
    })
    return this.disclosedDepositLoanDataAgent.find(depositLoanType, filter)
  }

  /**
   * Disclosed deposit loans summary by type.
   *
   * @summary Get disclosed deposit loans by filter
   *
   * @param {string} type loan / deposit
   *
   * @returns {IDisclosedDepositLoanSummary} list of disclosed deposit loans with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Get('type/{type}/summary')
  @SuccessResponse('200', 'GET')
  public async getSummary(@Path('type') type: DepositLoanTypeFeature): Promise<IDisclosedDepositLoanSummary[]> {
    const depositLoanType = getDepositLoanType(type)
    this.logger.info('Fetching deposit loans by summary', {
      type: depositLoanType
    })
    return this.disclosedDepositLoanDataAgent.disclosedSummary(depositLoanType, {})
  }
}
