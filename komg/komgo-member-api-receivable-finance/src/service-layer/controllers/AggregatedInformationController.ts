import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { IReceivablesDiscountingInfo } from '@komgo/types'
import { inject } from 'inversify'
import { Controller, Get, Path, Response, Route, Security, Tags, SuccessResponse, Query } from 'tsoa'

import { GetRDInfoUseCase, GetFilteredRDInfosUseCase } from '../../business-layer/rd/use-cases'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IPaginate } from '../responses'

import { mapAndThrowHttpException, INTERNAL_SERVER_ERROR_MESSAGE, parseFilter } from './utils'

/**
 * AggregatedInformationController Class
 *
 * @export
 * @class AggregatedInformationController
 * @extends {Controller}
 */
@Tags('ReceivableFinanceAggregation')
@Route('info')
@provideSingleton(AggregatedInformationController)
export class AggregatedInformationController extends Controller {
  private readonly logger = getLogger('AggregatedInformationController')

  constructor(
    @inject(TYPES.GetRDInfoUseCase) private readonly getRDInfoUseCase: GetRDInfoUseCase,
    @inject(TYPES.GetFilteredRDInfosUseCase) private readonly getFilteredRDInfosUseCase: GetFilteredRDInfosUseCase
  ) {
    super()
  }

  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Response<HttpException>('404', 'Receivable discounting not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Get('rd/{rdId}')
  @SuccessResponse(200, 'Receivable discounting info')
  public async getRdInfo(@Path() rdId: string): Promise<IReceivablesDiscountingInfo> {
    try {
      return await this.getRDInfoUseCase.execute(rdId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Response<HttpException>('422', 'Invalid filter query parameter')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @SuccessResponse(200, 'Receivable discounting info array')
  @Get('rd')
  public async findRdInfo(@Query('filter') filter: string = ''): Promise<IPaginate<IReceivablesDiscountingInfo[]>> {
    try {
      const parsedFilter = parseFilter(this.logger, filter)
      const rdInfos = await this.getFilteredRDInfosUseCase.execute(parsedFilter)
      return {
        limit: 0,
        skip: 0,
        items: rdInfos,
        total: rdInfos.length
      }
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }
}
