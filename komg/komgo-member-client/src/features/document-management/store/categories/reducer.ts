import * as immutable from 'immutable'
import { Reducer } from 'redux'
import { sortBy } from 'lodash'
import { CategoryAction, CategoryActionType, CategoryState, CategoryStateFields } from '../types'

export const intialStateFields: CategoryStateFields = {
  categories: [],
  error: null
}

export const initialState: CategoryState = immutable.Map(intialStateFields)

const reducer: Reducer<CategoryState> = (state = initialState, action: CategoryAction): CategoryState => {
  switch (action.type) {
    case CategoryActionType.FETCH_CATEGORIES_SUCCESS: {
      const categories = action.payload || []
      return state.set('categories', sortBy(categories, cat => cat.name))
    }
    case CategoryActionType.FETCH_CATEGORIES_ERROR: {
      return state.set('error', action.error)
    }
    default:
      return state
  }
}

export default reducer
