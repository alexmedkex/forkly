import { validateMongoFilter } from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { Controller, Route, Tags, Response, Security, Get, SuccessResponse, Path, Query } from 'tsoa'

import { IDisclosedCreditLineDataAgent } from '../../data-layer/data-agents/IDisclosedCreditLineDataAgent'
import { IDisclosedCreditLine } from '../../data-layer/models/IDisclosedCreditLine'
import { IDisclosedCreditLineSummary } from '../../data-layer/models/IDisclosedCreditLineSummary'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { DisclosedCreditLineFilter } from '../requests/DisclosedCreditLineFilter'
import { HttpServerMessages } from '../utils/HttpConstants'
import { resolveContext } from '../utils/utils'

/**
 * DisclosedCreditLine Controller
 * @export
 * @class DisclosedCreditLineController
 * @extends {Controller}
 */
@Tags('DisclosedCreditLine')
@Route('/disclosed-credit-lines')
@provideSingleton(DisclosedCreditLineController)
export class DisclosedCreditLineController extends Controller {
  private readonly logger = getLogger('DisclosedCreditLineController')

  constructor(
    @inject(TYPES.DisclosedCreditLineDataAgent) private disclosedCreditLineDataAgent: IDisclosedCreditLineDataAgent
  ) {
    super()
  }

  /**
   * Return disclosed credit line by staticId.
   *
   * @summary Get disclosed credit line by staticId.
   *
   * @param {string} id is the staticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('{id}')
  @SuccessResponse('200', 'GET')
  public async getById(@Path('id') id: string): Promise<IDisclosedCreditLine> {
    this.logger.info('Fetching disclosed credit line by staticId', {
      id
    })
    return this.disclosedCreditLineDataAgent.get(id)
  }

  /**
   * Get all disclosed credit lines. Disclosed credit lines can be filtered by credit line params that are proveded in GET request.
   *
   * @summary Get disclosed credit lines by filter
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} filter Query to filter disclosed credit lines. Accepts mongo style query
   *
   * @returns {ICreditLine} list of disclosed credit lines with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('product/{productId}/sub-product/{subProductId}')
  @SuccessResponse('200', 'GET')
  public async find(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Query('query') queryParams?: string
  ): Promise<IDisclosedCreditLine[]> {
    const filter = queryParams ? JSON.parse(queryParams) : {}
    await validateMongoFilter(filter, DisclosedCreditLineFilter, {})
    this.logger.info('Fetching all disclosed credit lines by filter', {
      filter
    })
    return this.disclosedCreditLineDataAgent.find({
      ...filter,
      context: resolveContext(productId, subProductId, filter.context)
    })
  }

  /**
   * Return disclosed credit line summary by productId, subproductId.
   *
   * @summary Get disclosed credit line summary by productId, subproductId.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   *
   * @returns {IDisclosedCreditLineSummary} list of disclosed credit lines with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('product/{productId}/sub-product/{subproductId}/summary')
  @SuccessResponse('200', 'GET')
  public async getSummaryByProduct(
    @Path('productId') productId: string,
    @Path('subproductId') subProductId: string
  ): Promise<IDisclosedCreditLineSummary[]> {
    this.logger.info('Fetching summary on disclosed credit line', {
      productId,
      subProductId
    })
    return this.disclosedCreditLineDataAgent.disclosedSummary({ productId, subProductId })
  }

  /**
   * Return disclosed credit line by productId, subproductId and counterpartyStatisId.
   *
   * @summary Get disclosed credit line by productId, subproductId and counterpartyStatisId.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} counterpartyStaticId is the counterpartyStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('/product/{productId}/sub-product/{subproductId}/{counterpartyStaticId}')
  @SuccessResponse('200', 'GET')
  public async getByProduct(
    @Path('productId') productId: string,
    @Path('subproductId') subProductId: string,
    @Path('counterpartyStaticId') counterpartyStaticId: string
  ): Promise<IDisclosedCreditLine[]> {
    this.logger.info('Fetching disclosed credit line', {
      productId,
      subProductId,
      counterpartyStaticId
    })
    return this.disclosedCreditLineDataAgent.find({
      context: resolveContext(productId, subProductId),
      counterpartyStaticId
    })
  }

  /**
   * Get disclosed credit lines summary. Disclosed credit lines can be filtered by context and query that are proveded in GET request.
   *
   * @summary Get disclosed credit lines summary by staticId
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} context Context to filter disclosed credit lines.
   * @param {filter} query Query to filter disclosed credit lines.
   *
   * @returns {IDisclosedCreditLineSummary} list of disclosed credit lines with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('/summary/product/{productId}/sub-product/{subProductId}')
  @SuccessResponse('200', 'GET')
  public async getSummary(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Query('context') contextParams: string,
    @Query('query') queryParams?: string
  ): Promise<IDisclosedCreditLineSummary[]> {
    const context = contextParams ? JSON.parse(contextParams) : {}
    const filter = queryParams ? JSON.parse(queryParams) : {}
    // await validateMongoFilter(context, DisclosedCreditLineRequest, {})
    this.logger.info('Fetching credit lines summary by context', {
      context
    })
    return this.disclosedCreditLineDataAgent.disclosedSummary(
      { ...context, productId, subProductId },
      {
        ...filter,
        context: resolveContext(productId, subProductId, filter.context)
      }
    )
  }
}
