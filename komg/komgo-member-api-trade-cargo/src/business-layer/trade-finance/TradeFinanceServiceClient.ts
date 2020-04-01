import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import { axiosRetry, exponentialDelay } from '../../retry'
import * as AxiosError from 'axios-error'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'

export interface ITradeFinanceServiceClient {
  getTradeFinanceServiceClient(tradeId: string)
}
@injectable()
export class TradeFinanceServiceClient implements ITradeFinanceServiceClient {
  private readonly logger = getLogger('TradeFinanceServiceClient')
  private readonly retryDelay = 1000

  constructor(@inject('tradeFinanceServiceUrl') private readonly tradeFinanceServiceUrl: string) {}

  async getTradeFinanceServiceClient(tradeId: string) {
    const url = `${this.tradeFinanceServiceUrl}/v0/lc?filter[query][tradeAndCargoSnapshot.trade._id]=${tradeId}&filter[projection][status]=1`
    let result

    try {
      result = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.HttpRequestFailed,
        'Error calling  the api-trade-finance',
        {
          url,
          axiosMessage: axiosError.message,
          axiosErrorData: this.getErrorResponse(axiosError)
        }
      )

      throw new Error(`Faield to get letters of credit. ${error.message}`)
    }

    if (result && result.data && result.data.length) {
      return result.data
    }

    this.logger.info('Could not find letters of credit', { tradeId })
    return null
  }

  private getErrorResponse(error: AxiosError) {
    if (error.response) return error.response.data
    return '<none>'
  }
}
