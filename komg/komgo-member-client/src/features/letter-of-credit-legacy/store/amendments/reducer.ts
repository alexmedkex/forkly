import { Reducer, AnyAction } from 'redux'
import { LetterOfCreditAmendmentState } from './types'
import { fromJS, Map } from 'immutable'
import { LetterOfCreditAmendmentActionType } from './types'

export const initialState: LetterOfCreditAmendmentState = fromJS({
  byStaticId: Map()
})

const reducer: Reducer<LetterOfCreditAmendmentState> = (
  state: LetterOfCreditAmendmentState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS:
      const byStaticId = state.get('byStaticId').mergeDeep(fromJS({ [action.payload.staticId]: action.payload }))
      return state.set('byStaticId', byStaticId)
    default:
      return state
  }
}

export default reducer
