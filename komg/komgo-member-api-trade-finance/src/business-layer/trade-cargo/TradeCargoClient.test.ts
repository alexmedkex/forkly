import 'reflect-metadata'
import mockAxios from 'axios'
import { TradeCargoClient } from './TradeCargoClient'
import { fakeCargo, fakeTrade } from '../messaging/mock-data/fakeTradeCargo'

let tradeCargoClient: TradeCargoClient
const mockGet = jest.fn(() => {
  return { data: { items: [] } }
})
mockAxios.get = mockGet

describe('TradeCargoClient', async () => {
  beforeEach(() => {
    tradeCargoClient = new TradeCargoClient('http://test', 10)
  })

  describe('getTrade', async () => {
    it('should return a trade', async () => {
      await tradeCargoClient.getTrade('1')
      expect(mockAxios.get).toBeCalledWith('http://test/v0/trades/1')
    })

    it('should be backwards compatible by returning a trade with vaktId', async () => {
      mockGet.mockResolvedValueOnce({
        data: { ...fakeTrade, vaktId: undefined, sourceId: 'TEST-ID-X' }
      })
      const trade = await tradeCargoClient.getTrade('1')

      expect(trade.vaktId).toEqual('TEST-ID-X')
    })
  })

  describe('getTradeByVakt', async () => {
    it('should return a trade by vakt', async () => {
      await tradeCargoClient.getTradeByVakt('1')
      expect(mockAxios.get).toBeCalledWith(
        'http://test/v0/trades?filter%5Bquery%5D%5BsourceId%5D=1&filter%5Bquery%5D%5Bsource%5D=VAKT'
      )
    })

    it('throw error on axios get', async () => {
      const errorMessage = 'error on axios get'
      mockGet.mockRejectedValue(new Error(errorMessage)) // not once, to pass retries
      await expect(tradeCargoClient.getTradeByVakt('1')).rejects.toBeDefined()
    })

    it('should be backwards compatible by returning a trade with vaktId', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          items: [{ ...fakeTrade, vaktId: undefined, sourceId: 'TEST-ID-Y' }]
        }
      })

      const trade = await tradeCargoClient.getTradeByVakt('1')

      expect(trade.vaktId).toEqual('TEST-ID-Y')
    })
  })

  describe('getCargoByTrade', async () => {
    beforeEach(() => {
      mockGet.mockResolvedValue({ data: [{ _id: 1 }] })
    })

    it('should return a cargo', async () => {
      const cargo = await tradeCargoClient.getCargoByTrade('1')
      expect(cargo).toEqual({ _id: 1 })
    })

    it('throw error on axios get', async () => {
      const errorMessage = 'error on axios get'
      mockGet.mockRejectedValue(new Error(errorMessage))

      const error = new Error(`Failed to get cargo. ${errorMessage}`)
      await expect(tradeCargoClient.getCargoByTrade('1')).rejects.toBeDefined()
    })

    it('should be backwards compatible by returning a cargo with vaktId', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ ...fakeCargo, vaktId: undefined, sourceId: 'TEST-ID-Z' }]
      })

      const cargo = await tradeCargoClient.getCargoByTrade('1')

      expect(cargo.vaktId).toEqual('TEST-ID-Z')
    })
  })
})
