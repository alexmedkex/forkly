import { ITrade } from '@komgo/types'

export const getTradeBySourceId = (state, source: string, sourceId: string): ITrade => {
  const list: ITrade[] = state
    .get('trades')
    .get('trades')
    .toList()
    .toJS()

  return list.filter(t => t.source === source && t.sourceId === sourceId)[0]
}

export const getTradeByTradeId = (state, tradeId: string): ITrade =>
  state
    .get('trades')
    .get('trades')
    .toJS()[tradeId]
