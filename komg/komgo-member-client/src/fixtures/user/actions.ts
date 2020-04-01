import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { HttpRequest } from '../../utils/http'
import * as ENDPOINTS from '../../utils/endpoints'

import {
  UserActionType,
  User,
  CreateUserData,
  CreateUserSuccessResponse,
  FetchUsersSuccess,
  FetchUsersError,
  PostUserSuccess,
  PostUserError
} from './types'
import { ApplicationState } from '../../store/reducers'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchUsersAsync: ActionCreator<ActionThunk> = () => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${ENDPOINTS.USERS_BASE_ENDPOINT}/users`, {
        onError: fetchUsersError,
        onSuccess: fetchUsersSuccess
      })
    )
  }
}

export const fetchUsersSuccess: ActionCreator<FetchUsersSuccess> = (users: User[]) => ({
  type: UserActionType.FETCH_USERS_SUCCESS,
  payload: users
})

export const fetchUsersError: ActionCreator<FetchUsersError> = error => ({
  type: UserActionType.FETCH_USERS_ERROR,
  error
})

export const postUserAsync: ActionCreator<ActionThunk> = (user: CreateUserData) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.post(`${ENDPOINTS.USERS_BASE_ENDPOINT}/users`, {
        data: user,
        onError: postUserError,
        onSuccess: postUserSuccess
      })
    )
  }
}

export const postUserSuccess: ActionCreator<PostUserSuccess> = (user: CreateUserSuccessResponse) => ({
  type: UserActionType.POST_USER_SUCCESS,
  payload: user
})

export const postUserError: ActionCreator<PostUserError> = error => ({
  type: UserActionType.POST_USER_ERROR,
  error
})
