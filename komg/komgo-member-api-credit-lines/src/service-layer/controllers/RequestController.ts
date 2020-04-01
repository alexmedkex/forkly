import { validateMongoFilter } from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { ICreateCreditLineRequest, CreditLineRequestType } from '@komgo/types'
import { Body, Controller, Get, Post, Route, Security, SuccessResponse, Tags, Path, Query, Response } from 'tsoa'

import { ICreditLineRequestService } from '../../business-layer/CreditLineRequestService'
import {
  ICreditLineValidationFactory,
  CreditLineValidationFactory
} from '../../business-layer/CreditLineValidationFactory'
import { ICreditLineRequestDataAgent } from '../../data-layer/data-agents/ICreditLineRequestDataAgent'
import { ICreditLineRequestDocument } from '../../data-layer/models/ICreditLineRequestDocument'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { CreditLineRequestFilter } from '../requests/CreditLineRequestFilter'
import { HttpServerMessages } from '../utils/HttpConstants'
import { resolveContext } from '../utils/utils'

/**
 * Request Controller
 * @export
 * @class RequestController
 * @extends {Controller}
 */
@Tags('Request Controller')
@Route('/requests')
@provideSingleton(RequestController)
export class RequestController extends Controller {
  private readonly logger = getLogger('RequestController')

  constructor(
    @inject(TYPES.CreditLineRequestDataAgent) private readonly creditLineRequestDataAgent: ICreditLineRequestDataAgent,
    @inject(TYPES.CreditLineRequestService) private readonly creditLineRequestService: ICreditLineRequestService,
    @inject(TYPES.CreditLineValidationFactory)
    private readonly creditLineValidationFactory: ICreditLineValidationFactory
  ) {
    super()
  }

  /**
   * Create - send new credit line request.
   *
   * @summary Create - send new credit line request.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {ICreateCreditLineRequest} creditLineRequest
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'crud'])
  @Post('product/{productId}/sub-product/{subProductId}')
  @SuccessResponse('201', 'Created')
  public async create(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Body() creditLineRequest: ICreateCreditLineRequest
  ): Promise<string[]> {
    this.logger.info('Validating create credit line')

    const creditLineSaveRequest = {
      ...creditLineRequest,
      context: resolveContext(productId, subProductId, creditLineRequest.context)
    }

    await this.creditLineValidationFactory.getCreditLineValidation(
      CreditLineValidationFactory.ValidationType(creditLineSaveRequest.context, true),
      creditLineRequest
    )

    this.logger.info('Creating credit line')

    this.setStatus(201)

    return this.creditLineRequestService.create(creditLineSaveRequest)
  }

  /**
   * Return credit line sent request by staticId.
   *
   * @summary Get credit line sent request by staticId.
   *
   * @param {string} id is the staticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('sent/{id}')
  @SuccessResponse('200')
  public async getById(@Path('id') id: string): Promise<ICreditLineRequestDocument> {
    this.logger.info('Fetching credit line request by staticId', {
      id
    })
    const result = await this.creditLineRequestDataAgent.get(id)

    if (result.requestType !== CreditLineRequestType.Requested) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, 'Not found credit line request by staticId')
    }

    return result
  }

  /**
   * Return credit line sent request by productId, subproductId and counterpartyStatisId.
   *
   * @summary Get credit line sent request by productId, subproductId and counterpartyStatisId.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} counterpartyStaticId is the counterpartyStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('{productId}/sub-product/{subproductId}/{counterpartyStaticId}/sent')
  @SuccessResponse('200')
  public async getByProduct(
    @Path('productId') productId: string,
    @Path('subproductId') subProductId: string,
    @Path('counterpartyStaticId') counterpartyStaticId: string
  ): Promise<ICreditLineRequestDocument[]> {
    this.logger.info('Fetching credit line requests by product', {
      productId,
      subProductId,
      counterpartyStaticId
    })
    return this.creditLineRequestDataAgent.find({
      context: resolveContext(productId, subProductId),
      counterpartyStaticId,
      requestType: CreditLineRequestType.Requested
    })
  }

  /**
   * Return credit line sent request by counterpartyStatisId.
   *
   * @summary Get credit line sent request by counterpartyStatisId.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} counterpartyStaticId is the counterpartyStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('product/{productId}/sub-product/{subProductId}/{counterpartyStaticId}/sent')
  @SuccessResponse('200')
  public async getByCounterparty(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Path('counterpartyStaticId') counterpartyStaticId: string
  ): Promise<ICreditLineRequestDocument[]> {
    this.logger.info('Fetching credit line requests by counterparty', {
      counterpartyStaticId
    })
    return this.creditLineRequestDataAgent.find({
      context: resolveContext(productId, subProductId),
      counterpartyStaticId,
      requestType: CreditLineRequestType.Requested
    })
  }

  /**
   * Get all credit line sent request. Credit line sent requests can be filtered by credit line params that are proveded in GET request.
   *
   * @summary Get credit line sent request by filter
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} filter Query to filter credit line sent request. Accepts mongo style query
   *
   * @returns {ICreditLine} list of credit line sent request with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('product/{productId}/sub-product/{subProductId}/sent')
  @SuccessResponse('200')
  public async findSent(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Query('query') queryParams?: string
  ): Promise<ICreditLineRequestDocument[]> {
    const filter = queryParams ? JSON.parse(queryParams) : {}
    await validateMongoFilter(filter, CreditLineRequestFilter, {})
    this.logger.info('Fetching all credit line request by filter', {
      filter
    })
    return this.creditLineRequestDataAgent.find({
      ...filter,
      context: resolveContext(productId, subProductId, filter.context),
      requestType: CreditLineRequestType.Requested
    })
  }

  /**
   * Return credit line received request by staticId.
   *
   * @summary Get credit line received request by staticId.
   *
   * @param {string} id is the staticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('received/{id}')
  @SuccessResponse('200')
  public async getReceivedById(@Path('id') id: string): Promise<ICreditLineRequestDocument> {
    this.logger.info('Fetching received credit line request by staticId', {
      id
    })
    const result = await this.creditLineRequestDataAgent.get(id)

    if (result.requestType !== CreditLineRequestType.Received) {
      throw ErrorUtils.notFoundException(
        ErrorCode.DatabaseMissingData,
        'Not found received credit line request by staticId'
      )
    }

    return result
  }

  /**
   * Return credit line received request by counterpartyStatisId.
   *
   * @summary Get credit line received request by counterpartyStatisId.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} counterpartyStaticId is the counterpartyStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('product/{productId}/sub-product/{subProductId}/{counterpartyStaticId}/received')
  @SuccessResponse('200')
  public async getReceivedByProduct(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Path('counterpartyStaticId') counterpartyStaticId: string
  ): Promise<ICreditLineRequestDocument[]> {
    this.logger.info('Fetching received credit line requests by product', {
      counterpartyStaticId
    })
    return this.creditLineRequestDataAgent.find({
      context: resolveContext(productId, subProductId),
      counterpartyStaticId,
      requestType: CreditLineRequestType.Received
    })
  }

  /**
   * Get all credit line received request. Credit line received requests can be filtered by credit line params that are proveded in GET request.
   *
   * @summary Get credit line received request by filter
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} filter Query to filter credit line received request. Accepts mongo style query
   *
   * @returns {ICreditLineRequestDocument} list of credit line received request with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('received/product/{productId}/sub-product/{subProductId}')
  @SuccessResponse('200')
  public async findReceived(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Query('query') queryParams?: string
  ): Promise<ICreditLineRequestDocument[]> {
    const filter = queryParams ? JSON.parse(queryParams) : {}
    await validateMongoFilter(filter, CreditLineRequestFilter, {})
    this.logger.info('Fetching all received credit line request by filter', {
      filter
    })
    return this.creditLineRequestDataAgent.find({
      ...filter,
      context: resolveContext(productId, subProductId, filter.context),
      requestType: CreditLineRequestType.Received
    })
  }

  /**
   * Decline pending received equests for counterparty
   *
   * @summary Decline requests for  specific product/subproduct
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} counterpartyStaticId is the counterpartyStaticId
   * @param {string[]} requestIds is the counterpartyStaticId
   *
   * @returns {ICreditLine} list of credit line received request with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'crud'])
  @Post('{productId}/sub-product/{subproductId}/{counterpartyStaticId}/decline')
  @SuccessResponse('200', 'Requests sucessfully declined')
  public async declinePendingRequests(
    @Path('productId') productId: string,
    @Path('subproductId') subProductId: string,
    @Path('counterpartyStaticId') counterpartyStaticId: string,
    @Body() requestIds: string[]
  ): Promise<void> {
    this.logger.info('Decline pending requests', {
      productId,
      subProductId,
      counterpartyStaticId,
      requestIds
    })

    await this.creditLineRequestService.closeAllPendingRequests(
      counterpartyStaticId,
      { productId, subProductId },
      requestIds
    )
  }
}
