import { fromJS, Map, List } from 'immutable'
import { Reducer, AnyAction } from 'redux'
import { LetterOfCreditState, LetterOfCreditActionType } from './types'
import { withTradeAndCargoSnapshotSourceIds } from '../utils/backwardsCompatible'

const actions = (action: AnyAction, state: LetterOfCreditState) => state.set('action', fromJS(action.payload))

export const initialState: LetterOfCreditState = fromJS({
  byId: Map(),
  ids: List(),
  error: null,
  action: { status: null, name: null, message: '' }
})

const letterOfCreditFailureRegexp = /@@letters-of-credit\/(.*)FAILURE$/

const reducer: Reducer<LetterOfCreditState> = (state: LetterOfCreditState = initialState, action: AnyAction) => {
  switch (action.type) {
    case LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS:
      // Backward compatible - pagination API response
      const payload = action.payload.items || action.payload
      const update = payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item._id]: withTradeAndCargoSnapshotSourceIds(item)
        }),
        {}
      )
      const letters = state.get('byId').mergeDeep(fromJS(update))
      const ids = payload.map((letter: any) => letter._id)
      return state
        .set('byId', letters)
        .set('ids', fromJS(ids))
        .set('error', null)
    case LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS: {
      const letterMap = state.get('byId').mergeDeep(
        fromJS({
          [action.payload._id!]: withTradeAndCargoSnapshotSourceIds(action.payload)
        })
      )

      return state.set('byId', letterMap).set('error', null)
    }

    case LetterOfCreditActionType.CLEAR_ERROR:
      return state.set('error', null)
    case LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_SUCCESS:
      const newItem = {
        [action.payload._id]: {
          reference: action.payload.reference
        }
      }

      const updatedMembers = state.get('byId').mergeDeep(fromJS(newItem))

      return state.set('byId', updatedMembers).set('error', null)
    case LetterOfCreditActionType.CHANGE_ACTION_STATUS: {
      return actions(action, state)
    }

    default:
      const matches = letterOfCreditFailureRegexp.exec(action.type)
      if (matches) {
        return state.set('error', action.payload)
      }
      return state
  }
}

export default reducer
