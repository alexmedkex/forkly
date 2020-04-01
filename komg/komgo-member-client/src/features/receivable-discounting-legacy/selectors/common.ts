import { ITradeEnriched } from '../../trades/store/types'
import { TradingRole } from '../../trades/constants'

export const selectSellerTrades = (trades: ITradeEnriched[]): ITradeEnriched[] => {
  return trades.filter(trade => trade.tradingRole === TradingRole.SELLER)
}
