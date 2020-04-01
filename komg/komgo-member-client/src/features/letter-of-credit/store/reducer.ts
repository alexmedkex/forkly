import {
  LetterOfCreditActionType,
  TemplatedLetterOfCreditState,
  FetchLettersOfCreditSuccessAction,
  GetLetterOfCreditSuccessAction,
  ILetterOfCreditWithData
} from './types'
import { fromJS, Map, List } from 'immutable'
import { Reducer, AnyAction } from 'redux'

export const initialState: TemplatedLetterOfCreditState = fromJS({
  byStaticId: Map(),
  staticIds: List(),
  total: 0
})

// We need to avoid merging the template as it is a tree structure
const overwriteTemplate = (state: TemplatedLetterOfCreditState, item: ILetterOfCreditWithData) => {
  const update = fromJS({ [item.staticId]: item })

  const lettersOfCredit = state.get('byStaticId').mergeDeep(update)

  return state.set(
    'byStaticId',
    item.templateInstance && item.templateInstance.template
      ? lettersOfCredit.setIn(
          // We need to always override the local template, merging is not good enough because
          // merging does not make sense in a tree data structure.
          [item.staticId, 'templateInstance', 'template'],
          fromJS(item.templateInstance.template)
        )
      : lettersOfCredit
  )
}

const reducer: Reducer<TemplatedLetterOfCreditState> = (
  state: TemplatedLetterOfCreditState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS: {
      const typedAction = action as FetchLettersOfCreditSuccessAction

      typedAction.payload.items.forEach(item => {
        state = overwriteTemplate(state, item)
      })

      return state.set('total', state.get('byStaticId').size)
    }

    case LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS: {
      const typedAction = action as GetLetterOfCreditSuccessAction

      state = overwriteTemplate(state, typedAction.payload)

      return state.set('total', state.get('byStaticId').size)
    }
    default:
      return state
  }
}

export default reducer
