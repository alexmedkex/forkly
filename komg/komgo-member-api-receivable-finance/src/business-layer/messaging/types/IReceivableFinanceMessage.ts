import { IReceivablesDiscounting, IQuote, ITradeSnapshot } from '@komgo/types'

import { IReply } from '../../../data-layer/models/replies/IReply'

import { UpdateType } from './UpdateType'

export interface IReceivableFinanceMessage<T> {
  version: number
  messageType: string
  data: T
  context?: any
}

export interface IPayload {
  senderStaticId: string
}

export interface IUpdatePayload<T> extends IPayload {
  entry: T
  updateType: UpdateType
}
export interface IRDUpdatePayload extends IUpdatePayload<IReceivablesDiscounting> {}
export interface IQuoteUpdatePayload extends IUpdatePayload<IQuote> {}
export interface ITradeSnapshotUpdatePayload extends IUpdatePayload<ITradeSnapshot> {}

export interface IAddDiscountingPayload<T> extends IPayload {
  reply: IReply
  entry?: T
  comment?: string
}

export interface IRDAddDiscountingPayload extends IAddDiscountingPayload<IReceivablesDiscounting> {}
export interface IRDQuoteAddDiscountingPayload extends IAddDiscountingPayload<IQuote> {}
