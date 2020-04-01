import { ITradeEnriched } from '../store/types'
import { TradingRole } from '../constants'

export const findTradesByRole = (trades: ITradeEnriched[], tradingRole: TradingRole, company: string) =>
  trades.filter(trade => trade[tradingRole] === company)
