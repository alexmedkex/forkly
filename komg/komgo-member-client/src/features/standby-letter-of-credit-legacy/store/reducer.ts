import { StandbyLetterOfCreditState, StandbyLetterOfCreditActionType } from './types'
import { fromJS, List, Map } from 'immutable'
import { Reducer, AnyAction } from 'redux'

export const initialState: StandbyLetterOfCreditState = fromJS({
  byId: Map(),
  ids: List(),
  total: 0
})

const reducer: Reducer<StandbyLetterOfCreditState> = (
  state: StandbyLetterOfCreditState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS: {
      const ids = action.payload.items.map((letter: any) => letter.staticId)
      const update = action.payload.items.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      const standByLCs = state.get('byId').mergeDeep(fromJS(update))
      return state
        .set('byId', standByLCs)
        .set('ids', fromJS(ids))
        .set('total', action.payload.total)
    }
    case StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS: {
      const letterMap = state.get('byId').mergeDeep(
        fromJS({
          [action.payload.staticId]: action.payload
        })
      )

      return state.set('byId', letterMap)
    }
    default:
      return state
  }
}

export default reducer
