import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { IHistory, IQuote, IQuoteBase, IStaticIdResponse } from '@komgo/types'
import { inject } from 'inversify'
import { Body, Controller, Get, Path, Post, Put, Response, Route, Security, SuccessResponse, Tags } from 'tsoa'

import * as RDQuoteUseCases from '../../business-layer/quotes/use-cases'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

import { cleanDBFields, INTERNAL_SERVER_ERROR_MESSAGE, mapAndThrowHttpException } from './utils'

/**
 * RDQuotesController Class
 *
 * @export
 * @class RDQuotesController
 * @extends {Controller}
 */
@Tags('RDQuotes')
@Route('quote')
@provideSingleton(RDQuotesController)
export class RDQuotesController extends Controller {
  private readonly logger = getLogger('RDQuotesController')

  constructor(
    @inject(TYPES.CreateQuoteUseCase) private readonly createQuoteUseCase: RDQuoteUseCases.CreateQuoteUseCase,
    @inject(TYPES.GetQuoteUseCase) private readonly getQuoteUseCase: RDQuoteUseCases.GetQuoteUseCase,
    @inject(TYPES.UpdateQuoteUseCase) private readonly updateQuoteUseCase: RDQuoteUseCases.UpdateQuoteUseCase,
    @inject(TYPES.ShareQuoteUseCase) private readonly shareQuoteUseCase: RDQuoteUseCases.ShareQuoteUseCase,
    @inject(TYPES.GetQuoteHistoryUseCase)
    private readonly getQuoteHistoryUseCase: RDQuoteUseCases.GetQuoteHistoryUseCase
  ) {
    super()
  }

  /**
   * Get single quote
   * @param staticId staticID of the Quote
   */
  @Response<HttpException>('404', 'Quote not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Get('{staticId}')
  @SuccessResponse(200, 'Quote')
  public async get(@Path() staticId: string): Promise<IQuote> {
    try {
      return await this.getQuoteUseCase.execute(staticId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Creates a new quote
   *
   * @param quote the quote
   * @returns the staticId of the quote
   */
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post()
  @SuccessResponse(200, 'Quote created')
  public async create(@Body() quote: IQuoteBase): Promise<IStaticIdResponse> {
    try {
      const staticId = await this.createQuoteUseCase.execute(quote)
      return { staticId }
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Updates a quote
   *
   * @param staticId staticId of the quote
   * @param quote the quote data
   */
  @Response<HttpException>('404', 'Quote not found')
  @Response<HttpException>('422', 'Invalid quote data')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @SuccessResponse('200', 'PUT')
  @Put('{staticId}')
  public async update(staticId: string, @Body() quote: IQuoteBase): Promise<IQuote> {
    try {
      return await this.updateQuoteUseCase.execute(staticId, cleanDBFields(quote))
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Shares a quote as a bank to a trader
   *
   * @param staticId staticId of the quote
   */
  @Response<HttpException>('404', 'Quote not found')
  @Response<HttpException>('422', 'Invalid Receivables discounting state')
  @Response<HttpException>('422', 'Failed to validate quote data')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @SuccessResponse(204, 'Quote shared')
  @Post('{staticId}/share')
  public async share(staticId: string): Promise<void> {
    try {
      return await this.shareQuoteUseCase.execute(staticId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Response<HttpException>('404', 'Quote not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Get('{staticId}/history')
  @SuccessResponse(200, 'Quote change history')
  public async getHistory(staticId: string): Promise<IHistory<IQuote>> {
    try {
      return await this.getQuoteHistoryUseCase.execute(staticId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }
}
