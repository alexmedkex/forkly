import { ITrade, ICargo } from '@komgo/types'

export interface ITradeAndCargoSnapshot {
  _id?: string
  source: string
  sourceId: string
  trade: ITrade
  cargo: ICargo
  createdAt?: Date | string | number
  updatedAt?: Date | string | number
}
