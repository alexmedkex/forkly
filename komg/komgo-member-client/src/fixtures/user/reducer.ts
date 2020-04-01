import * as immutable from 'immutable'
import { Reducer, AnyAction } from 'redux'

import { UserAction, UserState, UserStateFields, UserActionType } from './types'

const initialUserFields: UserStateFields = {
  users: []
}
export const initialUserState: UserState = immutable.Map(initialUserFields)

const reducer: Reducer<UserState> = (state: UserState = initialUserState, action: AnyAction): UserState => {
  switch (action.type) {
    case UserActionType.FETCH_USERS_SUCCESS:
      return state.set('users', action.payload)

    case UserActionType.POST_USER_SUCCESS:
      return state.set('users', [action.payload.account.user])
    default:
      return state
  }
}

export default reducer
