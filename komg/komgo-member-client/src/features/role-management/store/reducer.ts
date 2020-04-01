import { Map, List } from 'immutable'
import { Reducer } from 'redux'

import { User } from '../../../store/common/types'
import {
  RoleManagementState,
  RoleManagementActions,
  RoleStateProperties,
  RoleManagementActionType,
  Role,
  Product
} from './types'

const initialRoleState: RoleStateProperties = {
  roles: List<Role>(),
  rolesFetching: false,
  getRolesError: null,

  role: undefined,
  roleFetching: false,
  roleError: null,

  products: List<Product>(),
  productsFetching: false,
  productsError: null,

  filteredRoles: List<Role>(),

  postRoleFetching: false,
  postRoleError: null,

  putRoleFetching: false,
  putRoleError: null,

  deleteRoleFetching: false,
  deleteRoleError: null,

  roleUsers: List<User>(),
  roleUsersFetching: false,
  roleUsersError: null,

  allUsers: List<User>(),
  allUsersFetching: false,
  allUsersError: null,

  updateAssignedUsersFetching: false,
  updateAssignedUsersError: null
}

export const initialState: RoleManagementState = Map(initialRoleState)

const rolesReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.GET_ROLES_SUCCESS:
      const roles = List<Role>(action.payload)
      return state
        .set('rolesFetching', false)
        .set('getRolesError', null)
        .set('roles', roles)
    case RoleManagementActionType.GET_ROLES_FETCHING:
      return state
        .set('rolesFetching', true)
        .set('filteredRoles', List<Role>())
        .set('roles', List<Role>())
    case RoleManagementActionType.GET_ROLES_ERROR:
      return state.set('rolesFetching', false).set('getRolesError', action.payload)

    default:
      return state
  }
}

const roleReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.GET_ROLE_FETCHING:
      return state
        .set('role', undefined)
        .set('roleFetching', true)
        .set('roleError', null)
    case RoleManagementActionType.GET_ROLE_SUCCESS:
      return state
        .set('role', action.payload)
        .set('roleFetching', false)
        .set('roleError', null)
    case RoleManagementActionType.GET_ROLE_ERROR:
      return state
        .set('role', undefined)
        .set('roleFetching', false)
        .set('roleError', action.payload)

    default:
      return state
  }
}

const productsReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.GET_PRODUCTS_FETCHING:
      return state
        .set('products', List<Product>())
        .set('productsFetching', true)
        .set('productsError', null) // clean up all HTTP errors from previous form submission too
        .set('postRoleError', null)
        .set('putRoleError', null)
        .set('updateAssignedUsersError', null)
    case RoleManagementActionType.GET_PRODUCTS_SUCCESS:
      return state
        .set('products', List<Product>(action.payload))
        .set('productsFetching', false)
        .set('productsError', null)
    case RoleManagementActionType.GET_PRODUCTS_ERROR:
      return state
        .set('products', List<Product>())
        .set('productsFetching', false)
        .set('productsError', action.payload)

    default:
      return state
  }
}

const postRoleReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.POST_ROLE_FETCHING:
      return state.set('postRoleFetching', true).set('postRoleError', null)
    case RoleManagementActionType.POST_ROLE_SUCCESS:
      const newState = state.update('roles', (roles: List<Role>) => roles.push(action.payload)) as RoleManagementState
      return newState.set('postRoleFetching', false).set('postRoleError', null)
    case RoleManagementActionType.POST_ROLE_ERROR:
      return state.set('postRoleFetching', false).set('postRoleError', action.payload)

    default:
      return state
  }
}

const putRoleReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.PUT_ROLE_FETCHING:
      return state.set('putRoleFetching', true).set('putRoleError', null)
    case RoleManagementActionType.PUT_ROLE_SUCCESS:
      const updatedState = state.update('roles', (roles: List<Role>) => {
        return roles.update(roles.findIndex((role: Role) => role.id === action.payload.id), () => action.payload)
      }) as RoleManagementState
      return updatedState.set('putRoleFetching', false).set('putRoleError', null)
    case RoleManagementActionType.PUT_ROLE_ERROR:
      return state.set('putRoleFetching', false).set('putRoleError', action.payload)

    default:
      return state
  }
}

const deleteRoleReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.DELETE_ROLE_FETCHING:
      return state.set('deleteRoleFetching', true).set('deleteRoleError', null)
    case RoleManagementActionType.DELETE_ROLE_SUCCESS:
      const roleToDelete = action.payload
      const withoutDeletedRole = state.update('roles', (roles: List<Role>) =>
        roles.delete(roles.findIndex((role: Role) => role.id === roleToDelete.id))
      ) as RoleManagementState
      return withoutDeletedRole.set('deleteRoleFetching', false).set('deleteRoleError', null)
    case RoleManagementActionType.DELETE_ROLE_ERROR:
      return state.set('deleteRoleFetching', false).set('deleteRoleError', action.payload)

    default:
      return state
  }
}

const roleUsersReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.GET_ROLE_USERS_FETCHING:
      return state
        .set('roleUsers', List<User>())
        .set('roleUsersFetching', true)
        .set('roleUsersError', null)
    case RoleManagementActionType.GET_ROLE_USERS_SUCCESS:
      return state
        .set('roleUsers', List<User>(action.payload))
        .set('roleUsersFetching', false)
        .set('roleUsersError', null)
    case RoleManagementActionType.GET_ROLE_USERS_ERROR:
      return state
        .set('roleUsers', List<User>())
        .set('roleUsersFetching', false)
        .set('roleUsersError', action.payload)

    default:
      return state
  }
}

const allUsersReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.GET_ALL_USERS_FETCHING:
      return state
        .set('allUsers', List<User>())
        .set('allUsersFetching', true)
        .set('allUsersError', null)
    case RoleManagementActionType.GET_ALL_USERS_SUCCESS:
      return state
        .set('allUsers', List<User>(action.payload))
        .set('allUsersFetching', false)
        .set('allUsersError', null)
    case RoleManagementActionType.GET_ALL_USERS_ERROR:
      return state
        .set('allUsers', List<User>())
        .set('allUsersFetching', false)
        .set('allUsersError', action.payload)

    default:
      return state
  }
}

const updateAssignedUsersReducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  switch (action.type) {
    case RoleManagementActionType.UPDATE_ASSIGNED_USERS_FETCHING:
      return state.set('updateAssignedUsersFetching', true).set('updateAssignedUsersError', null)
    case RoleManagementActionType.UPDATE_ASSIGNED_USERS_SUCCESS:
      return state.set('updateAssignedUsersFetching', false).set('updateAssignedUsersError', null)
    case RoleManagementActionType.UPDATE_ASSIGNED_USERS_ERROR:
      return state.set('updateAssignedUsersFetching', false).set('updateAssignedUsersError', action.payload)

    default:
      return state
  }
}

const reducer: Reducer<RoleManagementState> = (
  state: RoleManagementState = initialState,
  action: RoleManagementActions
): RoleManagementState => {
  return [
    rolesReducer,
    roleReducer,
    productsReducer,
    postRoleReducer,
    putRoleReducer,
    deleteRoleReducer,
    roleUsersReducer,
    allUsersReducer,
    updateAssignedUsersReducer
  ].reduce((newState, nextReducer) => nextReducer(newState, action), state)
}

export default reducer
