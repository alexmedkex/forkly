import * as immutable from 'immutable'
import { Reducer, AnyAction } from 'redux'

import { TradeState, TradeStateProperties, TradeActionType } from './types'
import { LetterOfCreditActionType as LegacyLetterOfCreditActionType } from '../../letter-of-credit-legacy/store/types'
import { StandbyLetterOfCreditActionType } from '../../standby-letter-of-credit-legacy/store/types'
import { IStandbyLetterOfCredit, IReceivablesDiscountingInfo, ITrade } from '@komgo/types'
import _ from 'lodash'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { sortByDate, sortDate } from '../utils/selectors'
import { ReceivableDiscountingApplicationActionType } from '../../receivable-discounting-legacy/store/application/types'
import { LetterOfCreditActionType, ILetterOfCreditWithData } from '../../letter-of-credit/store/types'

const initialTradeStateProps: TradeStateProperties = {
  trades: immutable.Map(),
  tradeDocuments: immutable.List(),
  tradeIds: immutable.List(),
  tradeMovements: immutable.List(),
  totals: immutable.Map({
    buyer: 0,
    seller: 0
  }),
  error: null,
  confirmError: null
}

export const initialTradeState: TradeState = immutable.Map(initialTradeStateProps)

const tradesFailureRegexp = /@@trades\/(.*)FAILURE$/

const tradesFetched = (state: TradeState = initialTradeState, action: AnyAction): TradeState => {
  const projection = action.meta.params.filter.projection
  const tradeFilterList = action.meta.params.filter.query
  const total = action.payload.total
  const filterPropertiesForTotals = ['buyer', 'seller']
  const filtered = Object.keys(tradeFilterList)
    .filter(key => filterPropertiesForTotals.includes(key))
    .toString()
  // if projection consists of only an _id, expecting we are only
  // looking for a total in this request
  if (
    projection &&
    Object.keys(projection).length === 1 &&
    projection.constructor === Object &&
    projection.hasOwnProperty('_id')
  ) {
    const totals = state.get('totals').merge({
      [filtered!]: total
    })
    return state.set('totals', totals)
  }

  // otherwise, we are expecting to be setting the trades and the current
  // selected trade total
  const update = action.payload.items.reduce(
    (memo: any, item: any) => ({
      ...memo,
      [item._id]: item
    }),
    {}
  )

  const totals = state.get('totals').merge({
    [filtered!]: total
  })
  const trades = state.get('trades').mergeDeep(update)
  const ids = action.payload.items.map((i: any) => i._id)

  return state
    .set('trades', trades)
    .set('tradeIds', immutable.List(ids))
    .set('totals', totals)
    .set('error', null)
}

const reducer: Reducer<TradeState> = (state: TradeState = initialTradeState, action: AnyAction): TradeState => {
  const errors = errorsReducer(state, action)

  if (errors) {
    return errors
  }

  switch (action.type) {
    case TradeActionType.TRADE_SUCCESS: {
      return state.set(
        'trades',
        state.get('trades').mergeDeep({
          [action.payload._id!]: action.payload
        })
      )
    }
    case TradeActionType.TRADES_SUCCESS:
      return tradesFetched(state, action)

    case TradeActionType.TRADE_MOVEMENTS_SUCCESS:
      return state
        .set('tradeMovements', immutable.List(action.payload.items ? action.payload.items : action.payload))
        .set('error', null)

    case TradeActionType.TRADE_DOCUMENTS_SUCCESS:
      return state.set('tradeDocuments', immutable.List(action.payload)).set('error', null)

    case TradeActionType.SORT_TRADES:
      const { column, direction } = action.payload

      const sortedTrades = state
        .get('trades')
        .toList()
        .toJS()
        .sort((a: ITrade, b: ITrade) => {
          let fieldA = (a as any)[column]
          let fieldB = (b as any)[column]
          if (column === 'sourceId') {
            fieldA = fieldA as string
            fieldB = fieldB as string

            return fieldA.localeCompare(fieldB, undefined, { numeric: true, sensitivity: 'base' }) * direction
          }

          if (!fieldA) {
            return direction
          }
          if (!fieldB) {
            return -1 * direction
          }
          if (fieldA < fieldB) {
            return -1 * direction
          } else if (fieldA > fieldB) {
            return direction
          }
          return 0
        })
        .map((i: ITrade) => i && i._id)

      return state.set('tradeIds', immutable.List(sortedTrades))
    case TradeActionType.FILTER_TRADING_ROLE:
      const filteredTrades = state
        .get('trades')
        .toList()
        .toJS()
        .filter((t: any) => {
          if (t[action.payload.role]) {
            return t[action.payload.role] === action.payload.company
          }
          return false
        })
        .map((i: ITrade) => i && i._id)

      return state.set('tradeIds', immutable.List(filteredTrades))

    default:
      const result = reduceExternalActions(state, action)

      if (result) {
        return result
      }

      return reduceError(state, action)
  }
}

const reduceError: Reducer<TradeState> = (state: TradeState, action: AnyAction): TradeState => {
  // Needs to be right at the end of the reducer
  const match = tradesFailureRegexp.exec(action.type)
  if (match) {
    return state.set('error', action.payload)
  }

  return state
}

const reduceExternalActions: Reducer<TradeState> = (state: TradeState, action: AnyAction): TradeState => {
  return (
    reduceLCAction(state, action) ||
    reduceSBLCAction(state, action) ||
    reduceRDAction(state, action) ||
    reduceLetterOfCreditAction(state, action)
  )
}

const reduceLCAction: Reducer<TradeState> = (state: TradeState, action: AnyAction): TradeState => {
  switch (action.type) {
    case LegacyLetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS:
      return updateTradeStatuses(state, buildLegacyLCTradeStatuses(action.payload.items || action.payload))
    default:
      return null
  }
}

const reduceSBLCAction: Reducer<TradeState> = (state: TradeState, action: AnyAction): TradeState => {
  switch (action.type) {
    case StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS:
      return updateTradeStatuses(state, buildSBLCTradeStatuses(action.payload.items || action.payload))
    default:
      return null
  }
}

const reduceLetterOfCreditAction: Reducer<TradeState> = (state: TradeState, action: AnyAction): TradeState => {
  switch (action.type) {
    case LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS:
      return updateTradeStatuses(state, buildLCTradeStatuses(action.payload.items || action.payload))
    default:
      return null
  }
}

const reduceRDAction: Reducer<TradeState> = (state: TradeState, action: AnyAction): TradeState => {
  switch (action.type) {
    case ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS:
      const sellerTrades: ITrade[] = Object.values(state.get('trades').toJS())
      const sourceIdToRd: Map<string, IReceivablesDiscountingInfo> = new Map(
        action.payload.items.map(
          (rdData: IReceivablesDiscountingInfo) =>
            [rdData.rd.tradeReference.sourceId, rdData] as [string, IReceivablesDiscountingInfo]
        )
      )

      const newSellerTrades = sellerTrades.reduce((memo, t) => {
        return sourceIdToRd.has(t.sourceId)
          ? { ...memo, [t._id!]: { ...t, status: sourceIdToRd.get(t.sourceId).status } }
          : memo
      }, {})

      return state.set('trades', state.get('trades').mergeDeep(newSellerTrades))
    default:
      return null
  }
}

const updateTradeStatuses = (state: TradeState, newStatuses) => {
  const trades: Array<{ statusUpdatedAt?: Date | string | number } & ITrade> = Object.values(state.get('trades').toJS())

  const newTrades = trades.reduce((memo, t) => {
    const statusData = newStatuses[t.sourceId] || newStatuses[t._id]
    return statusData && (!t.statusUpdatedAt || sortDate(t.statusUpdatedAt, statusData.updatedAt) >= 0) // update status only with newer data
      ? { ...memo, [t._id!]: { ...t, status: statusData.status, statusUpdatedAt: statusData.updatedAt } }
      : memo
  }, {})

  return state.set('trades', state.get('trades').mergeDeep(newTrades))
}

const buildSBLCTradeStatuses = (letters: IStandbyLetterOfCredit[] = []) => {
  return _.mapValues(_.groupBy(letters, sblc => sblc.tradeId.sourceId), data => {
    data.sort(sortByDate)
    return data[0]
  })
}

const buildLCTradeStatuses = (letters: ILetterOfCreditWithData[] = []) => {
  return _.mapValues(_.groupBy(letters, lc => lc.templateInstance.data.trade.sourceId), data => {
    data.sort(sortByDate)
    return data[0]
  })
}

const buildLegacyLCTradeStatuses = (letters: ILetterOfCredit[] = []) => {
  return _.mapValues(
    _.groupBy(
      letters,
      lc => (lc.tradeAndCargoSnapshot ? lc.tradeAndCargoSnapshot.sourceId || lc.tradeAndCargoSnapshot._id : -1)
    ),
    data => {
      data.sort(sortByDate)
      return data[0]
    }
  )
}

const errorsReducer = (state = initialTradeState, action: AnyAction): TradeState | null => {
  switch (action.type) {
    case TradeActionType.CREATE_TRADE_FAILURE:
    case TradeActionType.EDIT_TRADE_FAILURE:
    case TradeActionType.CREATE_CARGO_FAILURE:
    case TradeActionType.EDIT_CARGO_FAILURE:
    case TradeActionType.DELETE_CARGO_FAILURE:
    case TradeActionType.DELETE_TRADE_FAILURE:
      return state.set('confirmError', action.payload)

    default:
      return null
  }
}

export default reducer
