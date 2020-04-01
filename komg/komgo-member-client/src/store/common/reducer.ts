import { Map } from 'immutable'
import { AnyAction, Reducer } from 'redux'

import { UIState, ActionType, UIStateFields, Profile } from './types'

const initialUIFields: UIStateFields = {
  loading: false,
  sidebarExtended: false,
  isActiveUser: true,
  users: [],
  usersAssigned: []
}

export const initialUIState: UIState = Map(initialUIFields)

const formatError = (error: string): string => {
  return error !== '' ? error : 'Error happened'
}

const defaultReducer: Reducer<UIState> = (state: UIState = initialUIState, action: AnyAction): UIState => {
  switch (action.type) {
    case ActionType.LOADING:
      return state.set('loading', action.payload)
    case ActionType.GetProfileSuccess:
      return state.set('error', null).set('profile', action.payload)
    case ActionType.PERMISSIONS_SUCCESS:
      return state.set('error', null).set('permissions', action.payload)
    case ActionType.SET_SIDEBAR_EXTENDED:
      return state.set('sidebarExtended', action.payload)
    default:
      return state
  }
}

const usersReducer: Reducer<UIState> = (state: UIState = initialUIState, action: AnyAction): UIState => {
  switch (action.type) {
    case ActionType.FETCH_USERS_SUCCESS:
      return state.set('error', null).set('users', action.payload)
    case ActionType.FETCH_USERS_BY_ROLE_SUCCESS:
      return state.set('error', null).set('usersAssigned', action.payload)
    case ActionType.FETCH_USERS_BY_ROLE_ERROR:
      return state.set('error', action.payload)
    case ActionType.ERROR:
    case ActionType.FETCH_USERS_ERROR:
      return state.set('error', formatError(action.payload))
    default:
      return state
  }
}

const settingsReducer: Reducer<UIState> = (state: UIState = initialUIState, action: AnyAction): UIState => {
  switch (action.type) {
    case ActionType.UpdateSettingsSuccess:
      return state.update('profile', (profile: Profile) => ({
        ...profile,
        settings: action.payload
      }))
    default:
      return state
  }
}

const reducer: Reducer<UIState> = (state: UIState = initialUIState, action: AnyAction): UIState => {
  return [defaultReducer, usersReducer, settingsReducer].reduce(
    (newState, nextReducer) => nextReducer(newState, action),
    state
  )
}

export default reducer
