import { fromJS, Map } from 'immutable'
import { AnyAction, Reducer } from 'redux'
import { ReceivableDiscountingActionType, ReceivableDiscountingState } from './types'

export const initialReceivableDiscountingState: ReceivableDiscountingState = fromJS({
  rfpSummariesByRdId: Map(), // Rename to rfpSummaryListById
  rfpSummariesByRdIdByParticipantStaticId: Map(),
  tradeSnapshotHistoryById: Map(),
  error: null
})

const receivableDiscountingFailureRegexp = /@@receivable-discounting\/(.*)FAILURE$/

const reducer: Reducer<ReceivableDiscountingState> = (
  state: ReceivableDiscountingState = initialReceivableDiscountingState,
  action: AnyAction
): ReceivableDiscountingState => {
  switch (action.type) {
    case ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS: {
      const update = state.get('rfpSummariesByRdId').mergeDeep(
        fromJS({
          [action.rdId]: action.payload.summaries
        })
      )
      return state.set('rfpSummariesByRdId', update)
    }

    case ReceivableDiscountingActionType.SUBMIT_QUOTE_SUCCESS:
    case ReceivableDiscountingActionType.REJECT_RFP_SUCCESS:
    case ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_SUCCESS:
      return state.set('error', null)

    case ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_SUCCESS: {
      const update = state.get('rfpSummariesByRdIdByParticipantStaticId').mergeDeep(
        fromJS({
          [action.rdId]: { [action.participantId]: action.payload }
        })
      )
      return state.set('rfpSummariesByRdIdByParticipantStaticId', update)
    }
    case ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_SUCCESS: {
      const update = state.get('tradeSnapshotHistoryById').mergeDeep(
        fromJS({
          [action.sourceId]: action.payload
        })
      )
      return state.set('tradeSnapshotHistoryById', update)
    }

    default:
      return reduceError(state, action)
  }
}

const reduceError: Reducer<ReceivableDiscountingState> = (
  state: ReceivableDiscountingState,
  action: AnyAction
): ReceivableDiscountingState => {
  // Needs to be right at the end of the reducer
  const match = receivableDiscountingFailureRegexp.exec(action.type)
  if (match) {
    return state.set('error', action.payload)
  }

  return state
}

export default reducer
