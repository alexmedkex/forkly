// Action types
import { AnyAction, MiddlewareAPI, Action, ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { IUserSettings } from '@komgo/types'

import { ImmutableMap } from '../../utils/types'
import { Map } from 'immutable'
import { ApplicationState } from '../reducers'
import { HttpRequest } from '../../utils/http'

// TODO: refactor all action names to match GetProfileRequest = '@@ui/GET_PROFILE_REQUEST' pattern
export enum ActionType {
  LOADING = '@@ui/LOADING',
  PERMISSIONS_SUCCESS = '@@ui/PERMISSIONS_SUCCESS',
  ERROR = '@@ui/ERROR',
  FETCH_USERS_BY_ROLE_SUCCESS = '@@ui/FETCH_USERS_BY_ROLE_SUCCESS',
  FETCH_USERS_BY_ROLE_ERROR = '@@ui/FETCH_USERS_BY_ROLE_ERROR',
  FETCH_USERS_SUCCESS = '@@ui/FETCH_USERS_SUCCESS',
  FETCH_USERS_ERROR = '@@ui/FETCH_USERS_ERROR',
  SET_SIDEBAR_EXTENDED = '@@ui/SET_SIDEBAR_EXTENDED',
  TRIGGER_ERROR_500_REQUEST = '@@ui/TRIGGER_ERROR_500_REQUEST',
  TRIGGER_ERROR_500_SUCCESS = '@@ui/TRIGGER_ERROR_500_SUCCESS',
  TRIGGER_ERROR_500_FAILURE = '@@ui/TRIGGER_ERROR_500_FAILURE',
  GetProfileRequest = '@@ui/GET_PROFILE_REQUEST',
  GetProfileSuccess = '@@ui/GET_PROFILE_SUCCESS',
  GetProfileFailure = '@@ui/GET_PROFILE_FAILURE',
  UpdateSettingsRequest = '@@ui/UPDATE_SETTINGS_REQUEST',
  UpdateSettingsSuccess = '@@ui/UPDATE_SETTINGS_SUCCESS',
  UpdateSettingsFailure = '@@ui/UPDATE_SETTINGS_FAILURE',
  ResetPasswordRequest = '@@ui/RESET_PASSWORD_REQUEST',
  ResetPasswordSuccess = '@@ui/RESET_PASSWORD_SUCCESS',
  ResetPasswordFailure = '@@ui/RESET_PASSWORD_FAILURE'
}

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  roles?: string[]
  createdAt: number
  company: string
}

export interface Permission {
  id: string
  label: string
  parentId?: string
  checked?: boolean
}

export interface Permissions {
  permissions?: Permission[]
}

export interface Profile extends User {
  roles: string[]
  permissions?: Permissions
  settings: IUserSettings
}

// State
export interface UIStateFields {
  loading: boolean
  sidebarExtended: boolean
  isActiveUser: boolean
  profile?: Profile
  permissions?: Permissions
  error?: string | null
  users: User[]
  usersAssigned: User[]
}

export interface LoaderStateProperties {
  requests: Map<string, boolean>
}
// https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/160497739/API%2BErrors%2BGuidelines
export interface ServerError {
  message: string
  errorCode: string
  requestId: string
  origin: string
  fields?: {
    [key: string]: string | string[]
  }
}

export interface ErrorStateProperties {
  byAction: Map<string, ServerError>
}

export interface Route {
  to: string
  exact: boolean
  name: string
  canView: boolean
  children: Route[]
  as: string
  additionalProps?: object
}

export type UIState = ImmutableMap<UIStateFields>
export type LoaderState = ImmutableMap<LoaderStateProperties>
export type ErrorsState = ImmutableMap<ErrorStateProperties>

// Actions
export interface SetLoading extends AnyAction {
  type: ActionType.LOADING
  payload: boolean
}

export interface SetSidebarExtended extends AnyAction {
  type: ActionType.SET_SIDEBAR_EXTENDED
  payload: boolean
}

export interface GetProfile extends AnyAction {
  type: ActionType.GetProfileSuccess
  payload: Profile
}

export interface GetPermissions extends AnyAction {
  type: ActionType.PERMISSIONS_SUCCESS
  payload: Permissions
}

export interface UiError extends AnyAction {
  type: ActionType.ERROR
  payload: string
}

export interface FetchUsersByRoleSuccess extends AnyAction {
  type: ActionType.FETCH_USERS_BY_ROLE_SUCCESS
  payload: User[]
}
export interface FetchUsersByRoleError extends AnyAction {
  type: ActionType.FETCH_USERS_BY_ROLE_ERROR
  payload: string
}

export interface FetchUsersSuccess extends AnyAction {
  type: ActionType.FETCH_USERS_SUCCESS
  payload: User[]
}
export interface FetchUsersError extends AnyAction {
  type: ActionType.FETCH_USERS_ERROR
  payload: string
}

export interface ActionWithAfterHandler extends AnyAction {
  afterHandler?: (storeAPI: MiddlewareAPI<any>) => any
  payload?: any
}

export interface UpdateSettings extends Action {
  type: ActionType.UpdateSettingsSuccess
  payload: IUserSettings
}

export interface ResetPassword extends Action {
  type: ActionType.ResetPasswordSuccess
}

export interface ResetPasswordError extends Action {
  type: ActionType.ResetPasswordFailure
}

export type UIAction =
  | SetLoading
  | GetProfile
  | GetPermissions
  | UiError
  | FetchUsersSuccess
  | FetchUsersError
  | FetchUsersByRoleSuccess
  | FetchUsersByRoleError
  | SetSidebarExtended
  | UpdateSettings
  | ResetPassword
  | ResetPasswordError

// Timer types
export interface ITimer {
  submissionDateTime: Date | string
  timerData: ITimerData[]
}

export interface ITimerData {
  id?: string
  timerId?: string
  time: Date | string
  status?: string
  retry?: number
}

export enum Order {
  Asc = 'ascending',
  Desc = 'descending'
}

export enum OrderMongoValue {
  ascending = 1,
  descending = -1
}
export interface IPaginate<T> {
  limit: number
  skip: number
  items: T
  total: number
}

export enum SortDirection {
  Ascending = 'ascending',
  Descending = 'descending'
}

export interface ISortingParams {
  key: string
  direction?: SortDirection
}

export type ApiActions = ThunkAction<Action, ApplicationState, HttpRequest>

export type ActionCreatorChainHandler<T = any, AC = ThunkAction<Action, ApplicationState, HttpRequest>> = (
  store: MiddlewareAPI<any>,
  data: T
) => ActionCreator<AC>
