import 'reflect-metadata'

jest.mock('../../retry', () => ({
  ...require.requireActual('../../retry'),
  exponentialDelay: (delay: number) => {
    return (retryNum: number) => {
      return 0
    }
  }
}))

import { TradeFinanceServiceClient } from './TradeFinanceServiceClient'
import mockAxios from 'axios'

const mockAxiosGet = jest.fn()
const mockAxiosPost = jest.fn<{}>()
mockAxios.get = mockAxiosGet
mockAxios.post = mockAxiosPost

describe('TradeFinanceServiceClient', () => {
  let apitTradeFinance
  beforeEach(() => {
    apitTradeFinance = new TradeFinanceServiceClient('http://api-trade-finance')
  })

  describe('getTradeFinanceServiceClient', () => {
    it('should get letter of credits', async () => {
      const lc = [{ _id: 1, status: 1 }]
      mockAxiosGet.mockImplementation(() => ({ data: lc }))
      const result = await apitTradeFinance.getTradeFinanceServiceClient('tradeId')

      expect(result).toMatchObject(lc)
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'http://api-trade-finance/v0/lc?filter[query][tradeAndCargoSnapshot.trade._id]=tradeId&filter[projection][status]=1'
      )
    })

    it('should throw error if request fails', async () => {
      mockAxiosGet.mockImplementation(() => {
        throw new Error('some api error')
      })
      const result = apitTradeFinance.getTradeFinanceServiceClient('tradeId')

      await expect(result).rejects.toEqual(new Error(`Faield to get letters of credit. some api error`))
    })

    it('should return null if no data retrieved', async () => {
      mockAxiosGet.mockImplementation(() => [])
      const result = await apitTradeFinance.getTradeFinanceServiceClient('tradeId')

      expect(result).toBeNull()
    })
  })
})
