import { fromJS, List, Map } from 'immutable'
import { AnyAction, Reducer } from 'redux'
import { QuoteActionType, QuoteState, FetchHistorySucceeded } from './types'

export const initialQuoteState: QuoteState = fromJS({
  byId: Map(),
  historyById: Map(),
  error: null,
  ids: List()
})

const quoteFailureRegexp = /@@receivable-discounting\/(.*)FAILURE$/

const reducer: Reducer<QuoteState> = (state: QuoteState = initialQuoteState, action: AnyAction): QuoteState => {
  switch (action.type) {
    case QuoteActionType.UPDATE_QUOTE_SUCCESS: {
      return mergeQuoteIntoByIdMap(state, action)
    }
    case QuoteActionType.FETCH_QUOTE_SUCCESS: {
      return mergeQuoteIntoByIdMap(state, action)
    }
    case QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS: {
      const typedAction = action as FetchHistorySucceeded
      const update = state.get('historyById').mergeDeep(
        fromJS({
          [typedAction.quoteId]: typedAction.payload
        })
      )

      return state.set('historyById', update)
    }

    default:
      return reduceError(state, action)
  }
}

function mergeQuoteIntoByIdMap(state: QuoteState, action: AnyAction) {
  const quoteMap = state.get('byId').mergeDeep(
    fromJS({
      [action.payload.staticId]: action.payload
    })
  )
  return state.set('byId', quoteMap).set('error', null)
}

const reduceError: Reducer<QuoteState> = (state: QuoteState, action: AnyAction): QuoteState => {
  // Needs to be right at the end of the reducer
  const match = quoteFailureRegexp.exec(action.type)
  if (match) {
    return state.set('error', action.payload)
  }

  return state
}

export default reducer
