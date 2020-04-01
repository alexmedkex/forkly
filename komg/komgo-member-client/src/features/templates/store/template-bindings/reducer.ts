import {
  EditorTemplateBindingsState,
  EditorTemplateBindingsActionType,
  GetTemplateBindingsSuccessAction,
  FetchTemplateBindingsSuccessAction
} from './types'
import { fromJS, List, Map } from 'immutable'
import { Reducer, AnyAction } from 'redux'

export const initialState: EditorTemplateBindingsState = fromJS({
  byStaticId: Map(),
  staticIds: List(),
  total: 0
})

const reducer: Reducer<EditorTemplateBindingsState> = (
  state: EditorTemplateBindingsState = initialState,
  action: AnyAction
) => {
  let mergedStaticIds
  switch (action.type) {
    case EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS:
      const typedAction = action as GetTemplateBindingsSuccessAction
      const newStaticId = fromJS({ [typedAction.payload.staticId]: typedAction.payload })

      mergedStaticIds = state.get('byStaticId').mergeDeep(newStaticId)
      return state.set('byStaticId', mergedStaticIds).set('total', mergedStaticIds.size)
    case EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS:
      const newStaticIdsMap = fromJS(
        (action as FetchTemplateBindingsSuccessAction).payload.items.reduce(
          (memo, item) => ({
            ...memo,
            [item.staticId]: item
          }),
          {}
        )
      )
      mergedStaticIds = state.get('byStaticId').mergeDeep(newStaticIdsMap)
      return state.set('byStaticId', mergedStaticIds).set('total', mergedStaticIds.size)
    default:
      return state
  }
}

export default reducer
