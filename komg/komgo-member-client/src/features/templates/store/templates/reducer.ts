import { EditorTemplatesState, EditorTemplatesActionType, FetchTemplatesSuccessAction } from './types'
import { fromJS, Map, List } from 'immutable'
import { Reducer, AnyAction } from 'redux'

export const initialState: EditorTemplatesState = fromJS({
  byStaticId: Map(),
  staticIds: List(),
  total: 0
})

const reducer: Reducer<EditorTemplatesState> = (state: EditorTemplatesState = initialState, action: AnyAction) => {
  switch (action.type) {
    case EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS: {
      const newStaticIdsMap = fromJS(
        (action as FetchTemplatesSuccessAction).payload.items.reduce(
          (memo, item) => ({
            ...memo,
            [item.staticId]: item
          }),
          {}
        )
      )
      // TODO LS we could implement with mergeDeepWith and force to use next "template"
      return state.set('byStaticId', newStaticIdsMap).set('total', newStaticIdsMap.size)
    }
    case EditorTemplatesActionType.GET_TEMPLATE_SUCCESS: {
      const { staticId } = action.payload
      const update = fromJS(action.payload)
      // TODO LS mergeDeepWith has to skip template
      return state.set('byStaticId', state.get('byStaticId').set(staticId, update))
    }

    case EditorTemplatesActionType.CREATE_TEMPLATE_SUCCESS: {
      const { staticId } = action.payload
      const update = fromJS(action.payload)
      return state.set('byStaticId', state.get('byStaticId').set(staticId, update))
    }
    // TODO LS to use this approach we need to pass the data in the meta in src/utils/http.ts
    // case EditorTemplatesActionType.UPDATE_TEMPLATE_SUCCESS: {
    //   // because a successful PUT returns an an empty object we assume the params were correct
    //   debugger
    //   const { staticId } = action.meta.params
    //   const update = fromJS(action.meta.params)
    //   return state.set('byStaticId', state.get('byStaticId').set(staticId, update))
    // }
    case EditorTemplatesActionType.DELETE_TEMPLATE_SUCCESS: {
      const {
        meta: { url }
      } = action
      const [staticId] = url.split('/').reverse()
      const byStaticId = state.get('byStaticId').delete(staticId)
      return state.set('byStaticId', byStaticId).set('total', byStaticId.size)
    }
    default:
      return state
  }
}

export default reducer
