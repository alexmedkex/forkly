import { IReceivablesDiscounting, ITradeSnapshot } from '@komgo/types'

export interface IProductRequest {
  rd: IReceivablesDiscounting
  trade: ITradeSnapshot
  createdAt: Date
  updatedAt: Date
}
