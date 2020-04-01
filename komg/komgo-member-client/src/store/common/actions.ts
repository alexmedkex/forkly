import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { IUserSettings, IUserSettingsRequest, IChangePasswordRequest } from '@komgo/types'

import { USERS_BASE_ENDPOINT, ROLES_BASE_ENDPOINT } from '../../utils/endpoints'
import { HttpRequest } from '../../utils/http'

import {
  ActionType,
  SetLoading,
  UIState,
  GetProfile,
  User,
  Profile,
  GetPermissions,
  FetchUsersError,
  FetchUsersSuccess,
  SetSidebarExtended
} from './types'
import * as ENDPOINTS from '../../utils/endpoints'
import { FetchUsersByRoleError, FetchUsersByRoleSuccess } from '../../store/common/types'
import { connectSocket } from '../../socket'
import { displayToast, TOAST_TYPE } from '../../features/toasts/utils'

export type ActionThunk = ThunkAction<Action, UIState, HttpRequest>

export const setLoading: ActionCreator<SetLoading> = (loadingState: boolean) => ({
  type: ActionType.LOADING,
  payload: loadingState
})

export const setSidebarExtended: ActionCreator<SetSidebarExtended> = (sidebarExtended: boolean) => ({
  type: ActionType.SET_SIDEBAR_EXTENDED,
  payload: sidebarExtended
})

export const getProfileAndPermissons: ActionCreator<ActionThunk> = () => (dispatch, _, api): Action =>
  dispatch(
    api.get(`${USERS_BASE_ENDPOINT}/profile`, {
      type: ActionType.GetProfileRequest,
      onSuccess: profileRecivedProxy,
      onError: ActionType.GetProfileFailure
    })
  )

export const profileRecivedProxy: ActionCreator<any> = (data, headers, meta) => {
  return (dispatch: any): any => {
    connectSocket(dispatch, data)
    dispatch(profileSuccess(data, headers, meta))
    dispatch(getPermissions(data, headers, meta))
  }
}

export const profileSuccess: ActionCreator<GetProfile> = (data: Profile, headers, meta) => {
  return {
    type: ActionType.GetProfileSuccess,
    payload: data,
    meta
  }
}

export const getPermissions: ActionCreator<ActionThunk> = (user: User) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${ROLES_BASE_ENDPOINT}/permissions-by-roles?roles=${(user.roles || []).join(',')}`, {
      onSuccess: permissionsSuccess,
      onError: ActionType.ERROR
    })
  )
}

export const permissionsSuccess: ActionCreator<GetPermissions> = (data, headers, meta) => {
  return {
    type: ActionType.PERMISSIONS_SUCCESS,
    payload: data,
    meta
  }
}

export const getUsers: ActionCreator<ActionThunk> = (productId?: string, actionId?: string) => {
  return (dispatch, getState, api): Action => {
    let url = `${ENDPOINTS.USERS_BASE_ENDPOINT}/users`
    if (productId && actionId) {
      url = `${url}?productId=${productId}&actionId=${actionId}`
    }
    return dispatch(
      api.get(url, {
        onError: getUsersError,
        onSuccess: getUsersSuccess
      })
    )
  }
}

export const getUsersSuccess: ActionCreator<FetchUsersSuccess> = (users: User[]) => ({
  type: ActionType.FETCH_USERS_SUCCESS,
  payload: users
})

export const clearError: ActionCreator<any> = (action: string) => (dispatch, _, api): Action => {
  const clearAction = { type: action.replace(/_REQUEST|_SUCCESS|_FAILURE/g, '_CLEAR_ERROR') }
  return dispatch(clearAction)
}

export const clearLoader: ActionCreator<any> = (action: string) => (dispatch, _, api): Action => {
  const clearAction = { type: action.replace(/_REQUEST|_SUCCESS|_FAILURE/g, '_CLEAR_LOADER') }
  return dispatch(clearAction)
}

export const getUsersError: ActionCreator<FetchUsersError> = error => ({
  type: ActionType.FETCH_USERS_ERROR,
  payload: error
})

export const getUsersByRole: ActionCreator<ActionThunk> = roleId => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${ENDPOINTS.USERS_BASE_ENDPOINT}/roles/${roleId}/users`, {
        onError: getUsersByRoleError,
        onSuccess: getUsersByRoleSuccess
      })
    )
  }
}

export const getUsersByRoleSuccess: ActionCreator<FetchUsersByRoleSuccess> = (users: User[]) => ({
  type: ActionType.FETCH_USERS_BY_ROLE_SUCCESS,
  payload: users
})

export const getUsersByRoleError: ActionCreator<FetchUsersByRoleError> = error => ({
  type: ActionType.FETCH_USERS_BY_ROLE_ERROR,
  payload: error
})

/**
 * This is needed for E2E tests so the System Error flow can be verified
 * "GET ${USERS_BASE_ENDPOINT}/misc/error-500" always returns HTTP 500
 */
export const triggerError500: ActionCreator<ActionThunk> = () => (dispatch, _, api): Action =>
  dispatch(
    api.get(`${USERS_BASE_ENDPOINT}/misc/error-500`, {
      type: ActionType.TRIGGER_ERROR_500_REQUEST,
      onSuccess: ActionType.TRIGGER_ERROR_500_SUCCESS,
      onError: ActionType.TRIGGER_ERROR_500_FAILURE
    })
  )

export const updateUserSettings: ActionCreator<ActionThunk> = (userId: string, data: IUserSettingsRequest) => (
  dispatch,
  _,
  api
): Action =>
  dispatch(
    api.put(`${USERS_BASE_ENDPOINT}/users/${userId}/settings`, {
      data,
      type: ActionType.UpdateSettingsRequest,
      onSuccess(payload: IUserSettings) {
        displayToast('Settings have been saved', TOAST_TYPE.Ok)
        return { type: ActionType.UpdateSettingsSuccess, payload }
      },
      onError: ActionType.UpdateSettingsFailure
    })
  )

export const resetPassword: ActionCreator<ActionThunk> = (userId: string, data: IChangePasswordRequest) => (
  dispatch,
  _,
  api
): Action =>
  dispatch(
    api.put(`${USERS_BASE_ENDPOINT}/users/${userId}/reset-password`, {
      data,
      type: ActionType.ResetPasswordRequest,
      onSuccess() {
        displayToast('Password has been changed', TOAST_TYPE.Ok)
        return { type: ActionType.ResetPasswordSuccess }
      },
      onError: ActionType.ResetPasswordFailure
    })
  )
