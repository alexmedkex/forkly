import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { AxiosInstance } from 'axios'
import { injectable, inject } from 'inversify'
import { stringify } from 'qs'

import { ErrorName } from '../../ErrorName'
import { TYPES, VALUES } from '../../inversify'
import { MicroserviceClientError } from '../errors'

import { executeGetRequest } from './utils'

const ERROR_MESSAGE = 'Invalid response returned from api-trade-cargo'

@injectable()
export class TradeCargoClient {
  private readonly logger = getLogger('TradeCargoClient')
  private readonly apiTradeCargoUrl: string

  constructor(
    @inject(VALUES.ApiTradeCargoBaseURL) apiTradeCargoBaseURL: string,
    @inject(TYPES.AxiosInstance) private readonly axios: AxiosInstance
  ) {
    this.apiTradeCargoUrl = apiTradeCargoBaseURL + '/v0/'
  }

  /**
   * Fetches a trade given a sourceId and source
   *
   * @param tradeSourceId source Id of the trade
   * @param tradeSource Source of the trade
   */
  public async getTrade(tradeSourceId: string, tradeSource: string): Promise<any> {
    const filter = {
      query: { sourceId: tradeSourceId, source: tradeSource }
    }

    const response = await executeGetRequest(this.logger, this.axios, `${this.apiTradeCargoUrl}trades`, {
      params: {
        filter: stringify(filter)
      }
    })

    // We assert that we only retrieve 1 trade
    if (!response.data || response.data.total !== 1) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.TradeCargoClientInvalidResponseTrades,
        ERROR_MESSAGE,
        {
          data: response.data
        }
      )

      throw new MicroserviceClientError('Invalid response format: getTrades', response.data)
    }

    return response.data.items[0]
  }

  /**
   * Fetches all movements of a given trade
   *
   * @param tradeId trade Id
   */
  public async getMovements(tradeId: string): Promise<any> {
    const response = await executeGetRequest(
      this.logger,
      this.axios,
      `${this.apiTradeCargoUrl}trades/${tradeId}/movements`
    )

    if (!response.data) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.TradeCargoClientInvalidResponseMovements,
        ERROR_MESSAGE,
        {
          data: response.data
        }
      )

      throw new MicroserviceClientError('Invalid response format: getMovements', response.data)
    }

    return response.data
  }
}
