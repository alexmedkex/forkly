import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { toast } from 'react-toastify'
import { List } from 'immutable'
import { History } from 'history'

import { User } from '../../../store/common/types'
import { HttpRequest } from '../../../utils/http'
import { ToastContainerIds } from '../../../utils/toast'
import { ROLES_BASE_ENDPOINT, USERS_BASE_ENDPOINT } from '../../../utils/endpoints'

import {
  RoleManagementState,
  RoleManagementActionType,
  PermissionFullId,
  RoleForm,
  NewRole,
  Role,
  UpdateAssignedUsersPayload
} from './types'

export type ActionThunk = ThunkAction<void, RoleManagementState, HttpRequest>

export const getRoles: ActionCreator<ActionThunk> = () => (dispatch, _, api) => {
  dispatch({ type: RoleManagementActionType.GET_ROLES_FETCHING })
  dispatch(
    api.get(`${ROLES_BASE_ENDPOINT}/roles`, {
      onSuccess: RoleManagementActionType.GET_ROLES_SUCCESS,
      onError: RoleManagementActionType.GET_ROLES_ERROR
    })
  )
}

export const getRole: ActionCreator<ActionThunk> = (id: string) => (dispatch, _, api) => {
  dispatch({ type: RoleManagementActionType.GET_ROLE_FETCHING })
  dispatch(
    api.get(`${ROLES_BASE_ENDPOINT}/roles/${id}`, {
      onSuccess: RoleManagementActionType.GET_ROLE_SUCCESS,
      onError: RoleManagementActionType.GET_ROLE_ERROR
    })
  )
}

export const getProducts: ActionCreator<ActionThunk> = () => (dispatch, _, api) => {
  dispatch({ type: RoleManagementActionType.GET_PRODUCTS_FETCHING })
  dispatch(
    api.get(`${ROLES_BASE_ENDPOINT}/role-templates`, {
      onSuccess: RoleManagementActionType.GET_PRODUCTS_SUCCESS,
      onError: RoleManagementActionType.GET_PRODUCTS_ERROR
    })
  )
}

export const createRole: ActionCreator<ActionThunk> = (formValues: RoleForm, history: History) => (
  dispatch,
  _,
  api
) => {
  dispatch({ type: RoleManagementActionType.POST_ROLE_FETCHING })
  dispatch(
    api.post(`${USERS_BASE_ENDPOINT}/roles`, {
      data: formValuesToRole(formValues),
      onSuccess(payload) {
        updateAssignedUsers(payload.id, formValues, history, 'Role has been added')(dispatch, _, api)
        return { type: RoleManagementActionType.POST_ROLE_SUCCESS, payload }
      },
      onError: RoleManagementActionType.POST_ROLE_ERROR
    })
  )
}

export const updateRole: ActionCreator<ActionThunk> = (roleId: string, formValues: RoleForm, history: History) => (
  dispatch,
  _,
  api
) => {
  dispatch({ type: RoleManagementActionType.PUT_ROLE_FETCHING })
  dispatch(
    api.put(`${USERS_BASE_ENDPOINT}/roles/${roleId}`, {
      data: formValuesToRole(formValues),
      onSuccess(payload) {
        updateAssignedUsers(roleId, formValues, history, 'Role has been updated')(dispatch, _, api)
        return { type: RoleManagementActionType.PUT_ROLE_SUCCESS, payload }
      },
      onError: RoleManagementActionType.PUT_ROLE_ERROR
    })
  )
}

const formValuesToRole = (formValues: RoleForm): NewRole => {
  const permittedActions: PermissionFullId[] = Object.keys(formValues.permissions)
    .map(permissionKey => {
      const permissionValue = formValues.permissions[permissionKey]

      if (!permissionValue) {
        return
      }

      const [productId, actionId] = permissionKey.split(':')

      const permittedAction: PermissionFullId = {
        product: productId,
        action: actionId,
        permission: typeof permissionValue === 'boolean' ? null : permissionValue
      }

      return permittedAction
    })
    .filter(v => !!v) as PermissionFullId[]

  const newRole: NewRole = {
    label: formValues.label.trim(),
    description: formValues.description ? formValues.description.trim() : '',
    permittedActions
  }
  return newRole
}

export const deleteRole: ActionCreator<ActionThunk> = (role: Role, onSuccess: () => void) => (dispatch, _, api) => {
  dispatch({ type: RoleManagementActionType.DELETE_ROLE_FETCHING })
  dispatch(
    api.delete(`${USERS_BASE_ENDPOINT}/roles/${role.id}`, {
      onSuccess() {
        toast.success('Role has been deleted', { containerId: ToastContainerIds.Default })
        onSuccess()
        return { type: RoleManagementActionType.DELETE_ROLE_SUCCESS, payload: role }
      },
      onError: RoleManagementActionType.DELETE_ROLE_ERROR
    })
  )
}

export const getRoleUsers: ActionCreator<ActionThunk> = (roleId: string) => (dispatch, _, api) => {
  dispatch({ type: RoleManagementActionType.GET_ROLE_USERS_FETCHING })
  dispatch(
    api.get(`${USERS_BASE_ENDPOINT}/roles/${roleId}/users`, {
      onSuccess: RoleManagementActionType.GET_ROLE_USERS_SUCCESS,
      onError(message, axiosError) {
        // treat 404 as no users are assigned to the given role
        if (axiosError.response && axiosError.response.status === 404) {
          return { type: RoleManagementActionType.GET_ROLE_USERS_SUCCESS, payload: List<User>() }
        } else {
          return { type: RoleManagementActionType.GET_ROLE_USERS_ERROR, payload: message }
        }
      }
    })
  )
}

export const getAllUsers: ActionCreator<ActionThunk> = () => (dispatch, _, api) => {
  dispatch({ type: RoleManagementActionType.GET_ALL_USERS_FETCHING })
  dispatch(
    api.get(`${USERS_BASE_ENDPOINT}/users`, {
      onSuccess: RoleManagementActionType.GET_ALL_USERS_SUCCESS,
      onError: RoleManagementActionType.GET_ALL_USERS_ERROR
    })
  )
}

export const updateAssignedUsers: ActionCreator<ActionThunk> = (
  roleId: string,
  formValues: RoleForm,
  history: History,
  successMessage: string
) => (dispatch, _, api) => {
  const updateAssignedUsersPayload: UpdateAssignedUsersPayload = {
    added: formValues.users.toBeAssigned.toArray(),
    removed: formValues.users.toBeUnassigned.toArray()
  }
  dispatch({ type: RoleManagementActionType.UPDATE_ASSIGNED_USERS_FETCHING })
  dispatch(
    api.patch(`${USERS_BASE_ENDPOINT}/roles/${roleId}/assigned-users`, {
      data: updateAssignedUsersPayload,
      onSuccess() {
        history.replace('/roles')
        toast.success(successMessage, { containerId: ToastContainerIds.Default })
        return { type: RoleManagementActionType.UPDATE_ASSIGNED_USERS_SUCCESS }
      },
      onError: RoleManagementActionType.UPDATE_ASSIGNED_USERS_ERROR
    })
  )
}
