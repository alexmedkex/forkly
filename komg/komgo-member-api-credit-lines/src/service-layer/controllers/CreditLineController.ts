import { validateMongoFilter } from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import { HttpException, ErrorUtils } from '@komgo/microservice-config'
import { ICreditLineResponse, ICreditLineSaveRequest } from '@komgo/types'
import 'reflect-metadata'
import {
  Body,
  Controller,
  Get,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Delete,
  Path,
  Query,
  Put,
  Response
} from 'tsoa'

import { ICreditLineService } from '../../business-layer/CreditLineService'
import {
  ICreditLineValidationFactory,
  CreditLineValidationFactory
} from '../../business-layer/CreditLineValidationFactory'
import { ICreditLineDataAgent } from '../../data-layer/data-agents/ICreditLineDataAgent'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { CreditLineFilter } from '../requests/CreditLineFilter'
import { HttpServerMessages } from '../utils/HttpConstants'
import { resolveContext } from '../utils/utils'

/**
 * CreditLine Controller
 * @export
 * @class CreditLineController
 * @extends {Controller}
 */
@Tags('CreditLines')
@Route('/credit-lines')
@provideSingleton(CreditLineController)
export class CreditLineController extends Controller {
  private readonly logger = getLogger('CreditLineController')

  constructor(
    @inject(TYPES.CreditLineDataAgent) private readonly creditLineDataAgent: ICreditLineDataAgent,
    @inject(TYPES.CreditLineService) private readonly creditLineService: ICreditLineService,
    @inject(TYPES.CreditLineValidationFactory)
    private readonly creditLineValidationFactory: ICreditLineValidationFactory
  ) {
    super()
  }

  /**
   * Create new credit line.
   *
   * @summary Create new credit line.
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'crud'])
  @Post('/product/{productId}/sub-product/{subProductId}')
  @SuccessResponse('201', 'Created')
  public async create(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Body() creditLine: ICreditLineSaveRequest
  ): Promise<string> {
    this.logger.info('Validating create credit line')

    const creditLineSaveRequest = {
      ...creditLine,
      context: resolveContext(productId, subProductId, creditLine.context)
    }

    await this.creditLineValidationFactory.getCreditLineValidation(
      CreditLineValidationFactory.ValidationType(creditLineSaveRequest.context),
      creditLineSaveRequest
    )

    this.logger.info('Creating credit line')

    this.setStatus(201)

    return this.creditLineService.create(creditLineSaveRequest)
  }

  /**
   * Update credit line by staticId.
   *
   * @summary Update credit line by staticId.
   *
   * @param {string} id is the staticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'crud'])
  @Put('{id}')
  @SuccessResponse('200', 'OK')
  public async update(@Path('id') id: string, @Body() creditLine: ICreditLineSaveRequest): Promise<void> {
    this.logger.info('Validating update credit line')

    await this.creditLineValidationFactory.getCreditLineValidation(
      CreditLineValidationFactory.ValidationType(creditLine.context),
      creditLine
    )

    this.logger.info('Updating credit line')

    this.setStatus(200)

    return this.creditLineService.update(id, creditLine)
  }

  /**
   * Return credit line by staticId.
   *
   * @summary Get credit line by staticId.
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
  public async getById(@Path('id') id: string): Promise<ICreditLineResponse> {
    this.logger.info('Fetching credit line by staticId', {
      id
    })
    return this.creditLineService.get(id)
  }

  /**
   * Return credit line by productId, subproductId and counterpartyStatisId.
   *
   * @summary Get credit line by productId, subproductId and counterpartyStatisId.
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
  @Get('/product/{productId}/sub-product/{subproductId}/{counterpartyStaticId}')
  @SuccessResponse('200', 'GET')
  public async getByProduct(
    @Path('productId') productId: string,
    @Path('subproductId') subProductId: string,
    @Path('counterpartyStaticId') counterpartyStaticId: string
  ): Promise<ICreditLineResponse> {
    this.logger.info('Fetching credit line', {
      productId,
      subProductId,
      counterpartyStaticId
    })
    return this.creditLineService.getByProduct(productId, subProductId, counterpartyStaticId)
  }

  /**
   * Get all credit lines. Credit lines can be filtered by credit line params that are proveded in GET request.
   *
   * @summary Get credit lines by filter
   *
   * @param {string} productId is the productId
   * @param {string} subProductId is the subProductId
   * @param {string} filter Query to filter credit lines. Accepts mongo style query
   *
   * @returns {ICreditLine} list of credit lines with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'read'])
  @Get('/product/{productId}/sub-product/{subProductId}')
  @SuccessResponse('200', 'GET')
  public async find(
    @Path('productId') productId: string,
    @Path('subProductId') subProductId: string,
    @Query('query') queryParams?: string
  ): Promise<ICreditLineResponse[]> {
    const filter = queryParams ? JSON.parse(queryParams) : {}
    await validateMongoFilter(filter, CreditLineFilter, {})
    this.logger.info('Fetching all credit lines by filter', {
      filter
    })
    return this.creditLineService.find({
      ...filter,
      context: resolveContext(productId, subProductId)
    })
  }

  /**
   * Delete the existing credit line by staticId
   *
   * @summary Delete the existing credit line by staticId
   *
   * @param {string} id staticId
   *
   * @returns {void} with status code 204
   */
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageRiskCover', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageBankLines', 'crud'])
  @Delete('{id}')
  @SuccessResponse('204', 'DELETE')
  public async delete(id: string): Promise<void> {
    this.logger.info('Deleting credit line', {
      id
    })

    this.setStatus(204)

    return this.creditLineService.delete(id)
  }
}
