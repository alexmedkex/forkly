import { Body, Controller, Delete, Get, Post, Put, Query, Route, Security, Tags, Response, SuccessResponse } from 'tsoa'
import { parse } from 'qs'
import logger, { getLogger } from '@komgo/logging'
import { validateMongoFilter } from '@komgo/data-access'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IIdentifier } from '../responses/IIdentifier'
import { ICargoDataAgent } from '../../data-layer/data-agents/ICargoDataAgent'
import { Cargo } from '../../data-layer/models/Cargo'
import { IPaginate } from './IPaginate'
import { queryParser } from './queryParser'
import { ITradeDataAgent } from '../../data-layer/data-agents/ITradeDataAgent'

import { CRUD_ACTIONS } from '../../data-layer/constants/CRUDActions'
import { ENTITY_TYPES } from '../../data-layer/constants/EntityTypes'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { ICargoValidator } from '../../data-layer/validation/CargoValidator'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { ITrade, ICargoBase, ICargo } from '@komgo/types'
import { HttpServerMessages } from '../utils/HttpConstants'
import { CargoRequest } from '../requests/CargoRequest'
import { IEventMessagePublisher } from '../events/IEventMessagePublisher'
import { CargoUpdateMessageUseCase } from '../../business-layer/CargoUpdateMessageUseCase'

/**
 * CargoController
 * @export
 * @class CargoController
 * @extends {Controller}
 */
@Tags('movements')
@Route('movements')
@provideSingleton(CargoController)
export class CargoController extends Controller {
  private readonly logger = getLogger('CargoController')
  private readonly cargoValidationFailed = 'Cargo validation failed'

  constructor(
    @inject(TYPES.CargoDataAgent) private cargoDataAgent: ICargoDataAgent,
    @inject(TYPES.TradeDataAgent) private tradeDataAgent: ITradeDataAgent,
    @inject(TYPES.CargoValidator) private readonly cargoValidator: ICargoValidator,
    @inject(TYPES.CargoUpdateMessageUseCase) private readonly cargoUpdateMessageUseCase: CargoUpdateMessageUseCase
  ) {
    super()
  }

  /**
   * Create new cargo
   *
   * @summary Create new cargo
   *
   * @param {ICreateCargoRequest} receivedRequest Spec of the new cargo
   *
   * @returns {IIdentifier} with status code 201
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Post()
  @SuccessResponse('201', 'POST')
  public async create(@Body() receivedRequest: ICargoBase): Promise<IIdentifier> {
    const { source, sourceId, ...options } = receivedRequest

    const errors = await this.cargoValidator.validate(receivedRequest)
    if (errors) {
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpSchema, this.cargoValidationFailed, errors)
    }

    // validate create
    const trade: ITrade = await this.tradeDataAgent.findOne({ sourceId }, source)
    if (!trade) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.TradeNotFound, 'Trade for cargo does not exists')
      throw ErrorUtils.badRequestException(ErrorCode.DatabaseMissingData, `Trade for cargo does not exists`, {
        trade: [`Trade with sourceId: ${sourceId} and source: ${source} doesn't exists`]
      })
    }

    const cargo = new Cargo(source, sourceId, options)
    const id = await this.cargoDataAgent.create(cargo)

    const newSavedCargo = await this.cargoDataAgent.get(id, source)
    await this.cargoUpdateMessageUseCase.execute({} as any, newSavedCargo)

    return { _id: id }
  }

  /**
   * Delete the existing cargo by id and source
   *
   * @summary Delete the existing cargo by id and source
   *
   * @param {string} id  Id of the cargo
   * @param {string} source movement source KOMGO|VAKT
   *
   * @returns {void} with status code 204
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Delete('{id}')
  @Response('204', 'DELETE')
  public async delete(id: string, @Query('source') source: string): Promise<void> {
    await this.cargoDataAgent.delete(id, source)
  }

  /**
   * Update the existing cargo by cargo id.
   *
   * @summary Update the existing cargo by cargo id.
   *
   * @param {string} id Id of the cargo
   * @param {ICargo} receivedRequest Spec of the update cargo
   *
   * @returns {void} with status code 201
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Put('{id}')
  @SuccessResponse('201', 'PUT')
  public async update(id: string, @Body() receivedRequest: ICargo): Promise<void> {
    const { source, sourceId, ...options } = receivedRequest

    const errors = await this.cargoValidator.validate(receivedRequest)
    if (errors) {
      this.logger.error(
        ErrorCode.ValidationHttpSchema,
        ErrorName.CargoValidationFailed,
        this.cargoValidationFailed,
        errors
      )
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpSchema, this.cargoValidationFailed, errors)
    }

    const existingCargo = await this.cargoDataAgent.get(id, source)

    const cargo = new Cargo(source, sourceId, options)
    const updatedCargo: ICargo = await this.cargoDataAgent.update(id, cargo)

    await this.cargoUpdateMessageUseCase.execute(existingCargo, updatedCargo)
  }

  /**
   * Get cargo by id and source
   *
   * @summary Get cargo by id and source
   *
   * @param {id} id  Id of the cargo
   * @param {string} source movement source KOMGO|VAKT
   *
   * @returns {ICargo} with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'read'])
  @Get('{id}')
  @SuccessResponse('200', 'GET')
  public async get(id: string, @Query('source') source: string): Promise<ICargo> {
    return this.cargoDataAgent.get(id, source)
  }

  /**
   * Get cargo by filter and source
   *
   * @summary Get cargo by filter and source
   *
   * @param {string} filter Query to filter movements. Accepts mongo style query
   * @param {string} source movement source KOMGO|VAKT
   *
   * @returns {ICargo} list of the cargo with status code 200
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'read'])
  @Get()
  @SuccessResponse('200', 'GET')
  public async find(@Query('filter') filter = {}, @Query('source') source: string): Promise<IPaginate<ICargo[]>> {
    const { query, projection, options } = queryParser(parse(filter, { arrayLimit: 1000 }))
    const { limit, skip } = options
    this.logger.info('CargoController find:', { query, projection, options })

    try {
      await validateMongoFilter(query, CargoRequest, { _id: ['$in'], sourceId: ['$in'] })
      const items: ICargo[] = await this.cargoDataAgent.find({ ...query, source }, projection, options)
      const total: number = await this.cargoDataAgent.count({ ...query, source })
      return {
        limit,
        skip,
        items,
        total
      }
    } catch (e) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidCargoData, e.message, {
        action: CRUD_ACTIONS.FIND,
        entityType: ENTITY_TYPES.CARGO,
        name: 'sort'
      })
      throw e
    }
  }
}
