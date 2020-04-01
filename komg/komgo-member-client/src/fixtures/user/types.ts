// Action types
import { Action } from 'redux'

import { ImmutableMap } from '../../utils/types'

export enum UserActionType {
  FETCH_USERS_SUCCESS = '@@user/FETCH_USERS_SUCCESS',
  FETCH_USERS_ERROR = '@@user/FETCH_USERS_ERROR',
  POST_USER_SUCCESS = '@@user/POST_USER_SUCCESS',
  POST_USER_ERROR = '@@user/POST_USER_ERROR'
}

// State
export interface UserStateFields {
  users: User[]
}

export type UserState = ImmutableMap<UserStateFields>

// Actions
export interface FetchUsersSuccess extends Action {
  type: UserActionType.FETCH_USERS_SUCCESS
  payload: User[]
}
export interface FetchUsersError extends Action {
  type: UserActionType.FETCH_USERS_ERROR
  error: Error
}
export interface PostUserSuccess extends Action {
  type: UserActionType.POST_USER_SUCCESS
  payload: CreateUserSuccessResponse
}
export interface PostUserError extends Action {
  type: UserActionType.POST_USER_ERROR
  error: Error
}

export type UserAction = FetchUsersSuccess | FetchUsersError | PostUserSuccess | PostUserError

export interface User {
  id: string
  username: string
  firstname: string
  lastname: string
  email: string
}

export interface CreateUserData {
  username: string
  firstname: string
  lastname: string
  password: string
  email: string
}

// TODO: Bring in Pick<T, K>, Subtract<T, K> ....
export interface CreateUserSuccessResponse {
  account: {
    user: {
      id: string
      username: string
      firstname: string
      lastname: string
      email: string
    }
    token: string
  }
}
