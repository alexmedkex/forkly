import { axiosRetry, exponentialDelay } from '../../retry'
import axios from 'axios'
import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import * as AxiosError from 'axios-error'
import { ITradeCargoClient } from './ITradeCargoClient'
import { stringify } from 'qs'
import { withVaktId } from './BackwardsCompatible'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { MicroserviceConnectionException, ContentNotFoundException } from '../../exceptions'

@injectable()
export class TradeCargoClient implements ITradeCargoClient {
  private logger = getLogger('TradeCargoClient')
  private tradeCargoUrl: string
  private readonly retryDelay: number
  private errorMessage = 'Error calling Trade API with code: %s. Response:'

  constructor(@inject(CONFIG.TradeCargoUrl) tradeCargoUrl: string | any, retryDelay: number = 1000) {
    this.tradeCargoUrl = tradeCargoUrl
    this.retryDelay = retryDelay
  }

  public async getTrade(id: string) {
    const url = `${this.tradeCargoUrl}/v0/trades/${id}`
    this.logger.info(`Getting trade info. URL=${url}`, { tradeId: id })
    try {
      const { data } = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
      this.logger.info('gotTrade:', { tradeId: id })
      return withVaktId(data)
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetTradeFailed,
        `Error calling the TradeCargo API: ${axiosError.message}`,
        this.getResponse(axiosError),
        { tradeId: id },
        new Error().stack
      )
      throw new Error(`Failed to get trade. ${error.message}`)
    }
  }

  async getTradeAndCargoBySourceAndSourceId(source: string, sourceId: string) {
    try {
      const trade = await this.getTradeBySourceAndSourceId(source, sourceId)
      if (!trade) {
        throw new ContentNotFoundException(`Failed to get trade: source=${source}, sourceId=${sourceId}`)
      }
      const tradeId = trade._id
      const url = `${this.tradeCargoUrl}/v0/trades/${tradeId}/movements`
      this.logger.info(`Getting cargo info.`, tradeId)
      const {
        data: [cargo]
      } = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
      const cargoWithVaktId = cargo ? withVaktId(cargo) : null
      return {
        trade,
        cargo: cargoWithVaktId
      }
    } catch (error) {
      if (error.constructor === ContentNotFoundException) {
        throw error
      }
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetTradeCargoBySourceAndSourceIdFailed,
        this.errorMessage,
        axiosError.message,
        this.getResponse(axiosError),
        {
          error: 'getCargoBySourceAndSourceId',
          sourceId
        }
      )
      throw new MicroserviceConnectionException(`Failed to get cargo. ${error.message}`)
    }
  }

  public async getTradeByVakt(vaktId: string) {
    const filter = {
      query: {
        sourceId: vaktId,
        source: 'VAKT'
      }
    }
    const url = `${this.tradeCargoUrl}/v0/trades?${stringify({ filter })}`

    this.logger.info(`Getting trade info.`, vaktId)

    try {
      const { data } = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
      const trade = data && data.items.length > 0 ? data.items.pop() : undefined
      return trade && withVaktId(trade)
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetTradeByVaktFailed,
        axiosError.message,
        this.getResponse(axiosError),
        {
          error: 'GetTradeByVaktFailed',
          sourceId: vaktId
        }
      )
      throw new MicroserviceConnectionException(`Failed to get trade.`)
    }
  }

  public async getCargoByTrade(tradeId: string) {
    const url = `${this.tradeCargoUrl}/v0/trades/${tradeId}/movements`
    this.logger.info(`Getting cargo info.`, tradeId)

    try {
      const {
        data: [cargo]
      } = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
      return cargo ? withVaktId(cargo) : null
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetCargoByTradeFailed,
        axiosError.message,
        this.getResponse(axiosError),
        tradeId
      )
      throw new MicroserviceConnectionException(`Failed to get cargo.`)
    }
  }

  private async getTradeBySourceAndSourceId(source: string, sourceId: string) {
    const filter = {
      query: {
        sourceId,
        source
      }
    }
    const url = `${this.tradeCargoUrl}/v0/trades?${stringify({ filter })}`

    this.logger.info(`Getting trade info.`, {
      source,
      sourceId
    })

    try {
      const { data } = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
      const trade = data && data.items.length > 0 ? data.items.pop() : undefined
      return trade ? trade && withVaktId(trade) : trade
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetTradeBySourceAndSourceId,
        this.errorMessage,
        axiosError.message,
        this.getResponse(axiosError),
        {
          error: 'getTradeBySourceAndSourceId',
          sourceId
        }
      )
      throw new MicroserviceConnectionException(`Failed to get trade. ${error.message}`)
    }
  }

  private getResponse(error: AxiosError): any {
    if (error.response) return error.response.data
    return '<none>'
  }
}
