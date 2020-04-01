import { TradeSource } from '@komgo/types'

export interface ITradeAndCargoSnapshot {
  _id?: string
  source: TradeSource
  sourceId: string
  trade: any
  cargo: any
  createdAt?: Date | string | number
  updatedAt?: Date | string | number
}
