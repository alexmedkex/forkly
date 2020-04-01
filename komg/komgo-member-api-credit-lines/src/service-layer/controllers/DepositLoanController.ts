import { validateMongoFilter } from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { ISaveDepositLoan, IDepositLoanResponse } from '@komgo/types'
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

import { IDepositLoanService } from '../../business-layer/deposit-loan/DepositLoanService'
import { IDepositLoanValidationService } from '../../business-layer/deposit-loan/DepositLoanValidationService'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { CreditLineFilter } from '../requests/CreditLineFilter'
import { HttpServerMessages } from '../utils/HttpConstants'

import { DepositLoanTypeFeature, getDepositLoanType } from './utils'

/**
 * DepositLoan Controller
 * @export
 * @class DepositLoanController
 * @extends {Controller}
 */
@Tags('DepositLoan')
@Route('/deposit-loan')
@provideSingleton(DepositLoanController)
export class DepositLoanController extends Controller {
  private readonly logger = getLogger('DepositLoanController')

  constructor(
    @inject(TYPES.DepositLoanService) private readonly depositLoanService: IDepositLoanService,
    @inject(TYPES.DepositLoanValidationService)
    private readonly depositLoanValidationService: IDepositLoanValidationService
  ) {
    super()
  }

  /**
   * Create new deposit or loan.
   *
   * @summary Create new deposit or loan.
   *
   * @param {DepositLoanTypeFeature} type deposit or loan
   * @param {ISaveDepositLoan} request Deposit / Loan data
   * @returns {Promise<string>}
   * @memberof DepositLoanController
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('409', 'Data with same parameters exits')
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Post('{type}')
  @SuccessResponse('201', 'Created')
  public async create(@Path('type') type: DepositLoanTypeFeature, @Body() request: ISaveDepositLoan): Promise<string> {
    const depositLoanType = getDepositLoanType(type)

    this.depositLoanValidationService.validateDepositLoan(request)

    this.logger.info(`Creating ${type}`)

    const staticId = await this.depositLoanService.create(depositLoanType, request)
    this.setStatus(201)

    return staticId
  }

  /**
   * Update Deposit / Loan data
   *
   * @param {DepositLoanType} type Deposit / Loan
   * @param {string} staticId staticId of the Deposit / Loan
   * @param {ISaveDepositLoan} request
   * @returns {Promise<void>}
   * @memberof DepositLoanController
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Put('/{type}/{staticId}')
  @SuccessResponse('200', 'OK')
  public async update(
    @Path('type') type: DepositLoanTypeFeature,
    @Path('staticId') staticId: string,
    @Body() request: ISaveDepositLoan
  ): Promise<void> {
    const depositLoanType = getDepositLoanType(type)

    this.depositLoanValidationService.validateDepositLoan(request)

    this.logger.info(`Updating ${type}`)

    await this.depositLoanService.update(depositLoanType, staticId, request)
    this.setStatus(200)
  }

  /**
   * Get Deposit / Loan by staticId
   *
   * @param {DepositLoanTypeFeature} type Deposit / Loan
   * @param {string} staticId staticId of the deposit / loan
   * @returns {Promise<IDepositLoanResponse>}
   * @memberof DepositLoanController
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'read'])
  @Get('{type}/{staticId}')
  @SuccessResponse('200', 'GET')
  public async getById(
    @Path('type') type: DepositLoanTypeFeature,
    @Path('staticId') staticId: string
  ): Promise<IDepositLoanResponse> {
    const depositLoanType = getDepositLoanType(type)

    this.logger.info(`Fetching ${type} by staticId`, {
      staticId
    })
    return this.depositLoanService.get(depositLoanType, staticId)
  }

  /**
   * Get list of Deposit / Loan
   *
   * @param {DepositLoanTypeFeature} type Deposit / Loan
   * @param {string} [queryParams] serialized filter object
   * @returns {Promise<IDepositLoanResponse[]>}
   * @memberof DepositLoanController
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'read'])
  @Get('{type}')
  @SuccessResponse('200', 'GET')
  public async find(
    @Path('type') type: DepositLoanTypeFeature,
    @Query('query') queryParams?: string
  ): Promise<IDepositLoanResponse[]> {
    const depositLoanType = getDepositLoanType(type)

    const filter = queryParams ? JSON.parse(queryParams) : {}
    await validateMongoFilter(filter, CreditLineFilter, {})
    this.logger.info(`Fetching ${type}`, {
      filter
    })

    return this.depositLoanService.find(depositLoanType, filter)
  }

  /**
   * Delete Deposit / Loan by staticId
   *
   * @param {string} staticId staticId of the Deposit / Loan
   * @returns {Promise<void>}
   * @memberof DepositLoanController
   */
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageDeposit', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageLoan', 'crud'])
  @Delete('{type}/{staticId}')
  @SuccessResponse('200')
  public async delete(@Path('type') type: DepositLoanTypeFeature, @Path('staticId') staticId: string): Promise<void> {
    const depositLoanType = getDepositLoanType(type)

    this.logger.info(`Deleting ${depositLoanType}`, {
      staticId
    })

    this.setStatus(204)

    return this.depositLoanService.delete(depositLoanType, staticId)
  }
}
