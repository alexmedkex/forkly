import { Body, Controller, Delete, Get, Post, Put, Query, Route, Security, Tags, Response, SuccessResponse } from 'tsoa'
import logger, { getLogger } from '@komgo/logging'
import { validateMongoFilter } from '@komgo/data-access'
import { queryParser } from './queryParser'
import { parse } from 'qs'

import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { LC_STATE } from '../../data-layer/constants/LCStates'

import { ICreateTradeResponse } from '../responses/ICreateTradeResponse'

import { ITradeFinanceServiceClient } from '../../business-layer/trade-finance/TradeFinanceServiceClient'
import { LOGGER_MESSAGES } from '../../data-layer/constants/LoggerMessages'
import { ITradeDataAgent } from '../../data-layer/data-agents/ITradeDataAgent'
import { Trade } from '../../data-layer/models/Trade'
import { IPaginate } from './IPaginate'
import { ICargoDataAgent } from '../../data-layer/data-agents/ICargoDataAgent'
import { CRUD_ACTIONS } from '../../data-layer/constants/CRUDActions'
import { ENTITY_TYPES } from '../../data-layer/constants/EntityTypes'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { CreditRequirements, ITradeBase, ITrade, ICargo } from '@komgo/types'
import { createTradeFromRequest } from './utils'

import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { HttpServerMessages } from '../utils/HttpConstants'
import { ITradeValidationService } from '../../business-layer/validation/TradeValidationService'
import { CargoRequest } from '../requests/CargoRequest'
import { TradeRequest } from '../requests/TradeRequest'
import { VALUES } from '../../inversify/values'
import { TradeUpdateMessageUseCase } from '../../business-layer/TradeUpdateMessageUseCase'

/**
 * TradeController
 * @export
 * @class TradeController
 * @extends {Controller}
 */
@Tags('trades')
@Route('trades')
@provideSingleton(TradeController)
export class TradeController extends Controller {
  private readonly logger = getLogger('TradeController')

  constructor(
    @inject(TYPES.TradeDataAgent)
    private readonly tradeDataAgent: ITradeDataAgent,
    @inject(TYPES.CargoDataAgent)
    private readonly cargoDataAgent: ICargoDataAgent,
    @inject(TYPES.TradeValidationService)
    private readonly tradeValidationService: ITradeValidationService,
    @inject(TYPES.TradeFinanceServiceClient)
    private readonly tradeFinanceServiceClient: ITradeFinanceServiceClient,
    @inject(TYPES.TradeUpdateMessageUseCase)
    private readonly tradeUpdateMessageUseCase: TradeUpdateMessageUseCase,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {
    super()
  }

  /**
   * Create new trade
   *
   * @summary Create new trade
   *
   * @param {IBaseTrade} receivedTradeRequest
   *
   * @returns {ICreateTradeResponse} with status code 201
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Post()
  @SuccessResponse('201', 'POST')
  public async create(@Body() receivedTradeRequest: ITradeBase): Promise<ICreateTradeResponse> {
    const newTrade = createTradeFromRequest(receivedTradeRequest)

    if (!newTrade.creditRequirement) {
      newTrade.creditRequirement = CreditRequirements.DocumentaryLetterOfCredit
    }

    const { source, sourceId, ...options } = newTrade

    const existingTradeWithId = await this.tradeDataAgent.findOne({ sourceId }, source)
    if (existingTradeWithId) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidTradeData,
        `Trade with same ID already exists. Source: ${source}, Id: ${sourceId}`
      )
      throw ErrorUtils.conflictException(
        ErrorCode.DatabaseInvalidData,
        `Trade with same ID already exists. Source: ${source}, Id: ${sourceId}`
      )
    }

    await this.tradeValidationService.validateCreate(newTrade)

    const trade = new Trade(source, sourceId, this.companyStaticId, options)
    const id = await this.tradeDataAgent.create(trade)
    return { _id: id, source, sourceId }
  }

  /**
   * Return trade by id
   *
   * @summary Get trade by trade id
   *
   * @param {string} id Id of the trade
   *
   * @returns {ITrade} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'read'])
  @Get('{id}')
  @SuccessResponse('200', 'GET')
  public async get(id: string): Promise<ITrade> {
    return this.tradeDataAgent.get(id)
  }

  /**
   * Get all trades. Trade can be filtered by trade context that is proveded in GET request.
   *
   * @summary Get trade by filter
   *
   * @param {string} filter Query to filter movements. Accepts mongo style query
   *
   * @returns {ITrade} list of trades with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'read'])
  @Get()
  @SuccessResponse('200', 'GET')
  // TODO LS we could validate the query against a JSON schema.
  // In this way we can keep track of valid filter used on the client
  public async find(@Query('filter') filter = {}): Promise<IPaginate<ITrade[]>> {
    const { query, projection, options } = queryParser(parse(filter, { arrayLimit: 1000 }))
    const { limit, skip } = options
    this.logger.info('TradeController find:', { query, projection, options })

    try {
      // TODO LS we should use JSON schema to validate the filter
      await validateMongoFilter(query, TradeRequest, {
        _id: ['$in'],
        sourceId: ['$in'],
        price: ['$eq', '$gt', '$gte', '$lt', '$lte']
      })

      const items: ITrade[] = await this.tradeDataAgent.find(query, projection, options)
      const total: number = await this.tradeDataAgent.count(query)
      return {
        limit,
        skip,
        items,
        total
      }
    } catch (e) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTradeData, e.message, {
        action: CRUD_ACTIONS.FIND,
        entityType: ENTITY_TYPES.TRADE,
        name: 'find'
      })
      throw e
    }
  }

  /**
   * Delete the existing trade by trade id
   *
   * @summary Delete the existing trade by trade id
   *
   * @param {string} id Id of the trade
   *
   * @returns {void} with status code 204
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Delete('{id}')
  @SuccessResponse('204', 'DELETE')
  public async delete(id: string): Promise<void> {
    const tradeFinenaceResult = await this.tradeFinanceServiceClient.getTradeFinanceServiceClient(id)
    if (
      tradeFinenaceResult &&
      tradeFinenaceResult.some(
        obj => obj.status !== LC_STATE.REQUEST_REJECTED && obj.status !== LC_STATE.ISSUED_LC_REJECTED
      )
    ) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTradeData, LOGGER_MESSAGES.INVALID_ARGUMENT, {
        action: CRUD_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.TRADE,
        id
      })
      throw ErrorUtils.conflictException(
        ErrorCode.DatabaseInvalidData,
        `You can't remove trade ${id}, trade have a LC document`
      )
    }
    await this.tradeDataAgent.delete(id)
  }

  /**
   * Update the existing trade by trade id.
   *
   * @summary Update the existing cargo by cargo id.
   *
   * @param {string} id Id of the trade
   * @param {IBaseTrade} receivedTradeRequest Spec of the update trade
   *
   * @returns {void} with status code 201
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Put('{id}')
  @SuccessResponse('201', 'PUT')
  public async update(id: string, @Body() receivedTradeRequest: ITrade): Promise<void> {
    const existingTrade = await this.tradeDataAgent.get(id)

    if (!existingTrade) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.TradeNotFound, `Trade with '${id}' is not found`)
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `Trade with '${id}' is not found`)
    }

    const tradeOnRequest: ITrade = {
      ...receivedTradeRequest,
      sourceId: existingTrade.sourceId,
      _id: existingTrade._id,
      status: existingTrade.status
    }

    if (!tradeOnRequest.creditRequirement) {
      tradeOnRequest.creditRequirement = CreditRequirements.DocumentaryLetterOfCredit
    }

    await this.tradeValidationService.validateUpdate(tradeOnRequest, existingTrade)

    const { source, sourceId, ...options } = tradeOnRequest

    const trade = new Trade(source, sourceId, this.companyStaticId, options)
    const updatedTrade: ITrade = await this.tradeDataAgent.update(id, trade)

    await this.tradeUpdateMessageUseCase.execute(existingTrade, updatedTrade)
  }

  /**
   * Get movements by trade id and query filter
   *
   * @summary Get movements by trade id and query filter
   *
   * @param {string} filter Query to filter movements. Accepts mongo style query
   * @param {string} id  Id of the trade
   *
   * @returns {ICargo} list of cargo with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', 'Trade with specified id not found')
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'read'])
  @Get('{id}/movements')
  @SuccessResponse('200', 'GET')
  public async fetchMovements(@Query('filter') filter = {}, id: string): Promise<ICargo[]> {
    const { query, projection, options } = queryParser(parse(filter, { arrayLimit: 1000 }))
    this.logger.info('findMovements', {
      action: CRUD_ACTIONS.FIND,
      entityType: ENTITY_TYPES.CARGO,
      name: 'fetchMovements',
      query,
      projection,
      options
    })
    try {
      await validateMongoFilter(query, CargoRequest, {
        _id: ['$in'],
        sourceId: ['$in']
      })
      const trade = await this.tradeDataAgent.get(id)
      return await this.cargoDataAgent.find({ ...query, sourceId: trade.sourceId }, projection, options)
    } catch (e) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidCargoData, e.message, {
        action: CRUD_ACTIONS.FIND,
        entityType: ENTITY_TYPES.CARGO,
        name: 'fetchMovements'
      })

      throw e
    }
  }
}
