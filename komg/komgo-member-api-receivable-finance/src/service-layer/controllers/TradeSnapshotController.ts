import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { IHistory, ITradeSnapshot } from '@komgo/types'
import { inject } from 'inversify'
import { Controller, Route, Tags, Security, Response, SuccessResponse, Get } from 'tsoa'

import { GetTradeHistoryUseCase } from '../../business-layer/trade-snapshot/use-cases'
import { TYPES } from '../../inversify'
import { provideSingleton } from '../../inversify/ioc'

import { mapAndThrowHttpException, INTERNAL_SERVER_ERROR_MESSAGE } from './utils'

/**
 * TradeSnapshotController Class
 *
 * @export
 * @class TradeSnapshotController
 * @extends {Controller}
 */
@Tags('TradeSnapshotController')
@Route('trade')
@provideSingleton(TradeSnapshotController)
export class TradeSnapshotController extends Controller {
  private readonly logger = getLogger('TradeSnapshotController')

  constructor(@inject(TYPES.GetTradeHistoryUseCase) private readonly getTradeHistoryUseCase: GetTradeHistoryUseCase) {
    super()
  }

  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Response<HttpException>('404', 'Quote not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Get('{sourceId}/history')
  @SuccessResponse(200, 'Trade change history')
  public async getHistory(sourceId: string): Promise<IHistory<ITradeSnapshot>> {
    try {
      return await this.getTradeHistoryUseCase.execute(sourceId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }
}
