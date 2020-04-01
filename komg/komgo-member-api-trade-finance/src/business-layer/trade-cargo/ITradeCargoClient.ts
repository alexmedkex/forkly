import { ITrade, ICargo } from '@komgo/types'

export interface ITradeCargoClient {
  getTrade(id: string): Promise<ITrade>
  getCargoByTrade(tradeId: string): Promise<ICargo>
  getTradeAndCargoBySourceAndSourceId(source: string, sourceId: string): Promise<any>
  getTradeByVakt(vaktId: string): Promise<ITrade>
}
