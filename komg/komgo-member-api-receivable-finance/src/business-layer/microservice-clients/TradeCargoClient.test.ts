import Axios, { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { createRetryingAxios } from '../../utils/axiosRetryFactory'
import { MicroserviceClientError } from '../errors'

import { TradeCargoClient } from './TradeCargoClient'

const API_TRADE_CARGO_DOMAIN = 'http://api-trade-cargo'
const SOURCE = 'KOMGO'

const mockTrade = {
  _id: 'tradeId',
  sourceId: 'sourceId',
  SOURCE
}
const defaultResponseTradeData = {
  total: 1,
  items: [mockTrade]
}

describe('TradeCargoClient', () => {
  let dataAgent: TradeCargoClient
  let axiosMock: MockAdapter
  let axiosInstance: AxiosInstance
  beforeAll(() => {
    axiosMock = new MockAdapter(Axios)
    axiosInstance = createRetryingAxios(0)
  })

  beforeEach(() => {
    dataAgent = new TradeCargoClient(API_TRADE_CARGO_DOMAIN, axiosInstance)
  })

  describe('getTrade', () => {
    it('should get a trade successfully', async () => {
      axiosMock.onGet(/api-trade-cargo.*/).replyOnce(200, defaultResponseTradeData)

      const trade = await dataAgent.getTrade('sourceId', SOURCE)

      expect(trade).toEqual(defaultResponseTradeData.items[0])
    })

    it('should throw an error if no data is returned', async () => {
      axiosMock.onGet(/api-trade-cargo.*/).replyOnce(200, null)

      await expect(dataAgent.getTrade('sourceId', SOURCE)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if there is not exactly one trade returned', async () => {
      const expectedData = { ...defaultResponseTradeData, total: 2 }
      axiosMock.onGet(/api-trade-cargo.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getTrade('sourceId', SOURCE)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onGet(/api-trade-cargo.*/).networkErrorOnce(500)

      await expect(dataAgent.getTrade('sourceId', SOURCE)).rejects.toThrowError(MicroserviceClientError)
    })
  })

  describe('getMovements', () => {
    it('should get movements of a trade successfully', async () => {
      const expectedData = [
        {
          _id: 'movementId0'
        },
        {
          _id: 'movementId1'
        }
      ]
      axiosMock.onGet(/api-trade-cargo.*/).replyOnce(200, expectedData)

      const movements = await dataAgent.getMovements('tradeId')

      expect(movements).toEqual(expectedData)
    })

    it('should throw an error if no data is returned', async () => {
      axiosMock.onGet(/api-trade-cargo.*/).replyOnce(200, null)

      await expect(dataAgent.getMovements('tradeId')).rejects.toThrowError(MicroserviceClientError)
    })
  })
})
