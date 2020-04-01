import { IReceivablesDiscountingInfo } from '@komgo/types'

export const getReceivableDiscountingInfoByRdId = (state, rdId: string): IReceivablesDiscountingInfo =>
  state
    .get('receivableDiscountingApplication')
    .get('byId')
    .toJS()[rdId] || undefined

export const getReceivableDiscountingInfoByTradeId = (state, tradeSourceId: string) =>
  Object.values(
    state
      .get('receivableDiscountingApplication')
      .get('byId')
      .toJS()
  ).find((rdInfo: IReceivablesDiscountingInfo) => tradeSourceId === rdInfo.rd.tradeReference.sourceId)
