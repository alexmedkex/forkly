import { Action } from 'redux'
import { List, Set, Map } from 'immutable'

import { ImmutableMap, stringOrNull } from '../../../utils/types'
import { User } from '../../../store/common/types'

export enum RoleManagementActionType {
  GET_ROLES_FETCHING = '@@roles/GET_ROLES_FETCHING',
  GET_ROLES_SUCCESS = '@@roles/GET_ROLES_SUCCESS',
  GET_ROLES_ERROR = '@@roles/GET_ROLES_ERROR',

  GET_ROLE_FETCHING = '@@roles/GET_ROLE_FETCHING',
  GET_ROLE_SUCCESS = '@@roles/GET_ROLE_SUCCESS',
  GET_ROLE_ERROR = '@@roles/GET_ROLE_ERROR',

  GET_PRODUCTS_FETCHING = '@@roles/GET_ROLPRODUCTSTCHING',
  GET_PRODUCTS_SUCCESS = '@@roles/GET_ROPRODUCTSUCCESS',
  GET_PRODUCTS_ERROR = '@@roles/GET_PRODUCTS_ERROR',

  POST_ROLE_FETCHING = '@@roles/POST_ROLE_FETCHING',
  POST_ROLE_SUCCESS = '@@roles/POST_ROLE_SUCCESS',
  POST_ROLE_ERROR = '@@roles/POST_ROLE_ERROR',

  PUT_ROLE_FETCHING = '@@roles/PUT_ROLE_FETCHING',
  PUT_ROLE_SUCCESS = '@@roles/PUT_ROLE_SUCCESS',
  PUT_ROLE_ERROR = '@@roles/PUT_ROLE_ERROR',

  DELETE_ROLE_FETCHING = '@@roles/DELETE_ROLE_FETCHING',
  DELETE_ROLE_SUCCESS = '@@roles/DELETE_ROLE_SUCCESS',
  DELETE_ROLE_ERROR = '@@roles/DELETE_ROLE_ERROR',

  GET_ROLE_USERS_FETCHING = '@@roles/GET_ROLE_USERS_FETCHING',
  GET_ROLE_USERS_SUCCESS = '@@roles/GET_ROLE_USERS_SUCCESS',
  GET_ROLE_USERS_ERROR = '@@roles/GET_ROLE_USERS_ERROR',

  GET_ALL_USERS_FETCHING = '@@roles/GET_ALL_USERS_FETCHING',
  GET_ALL_USERS_SUCCESS = '@@roles/GET_ALL_USERS_SUCCESS',
  GET_ALL_USERS_ERROR = '@@roles/GET_ALL_USERS_ERROR',

  UPDATE_ASSIGNED_USERS_FETCHING = '@@roles/UPDATE_ASSIGNED_USERS_FETCHING',
  UPDATE_ASSIGNED_USERS_SUCCESS = '@@roles/UPDATE_ASSIGNED_USERS_SUCCESS',
  UPDATE_ASSIGNED_USERS_ERROR = '@@roles/UPDATE_ASSIGNED_USERS_ERROR',

  SEARCH_ROLE = '@@roles/SEARCH_ROLE'
}

export interface Permission {
  id: string
  label: string
}

export interface ActionType {
  id: string
  label: string
  permissions?: Permission[]
}

export interface Product {
  id: string
  label: string
  actions?: ActionType[]
}

export interface PermittedActions {
  product: Product
  action: ActionType
  permission: Permission
}

export interface Role {
  id: string
  label: string
  description?: string
  isSystemRole?: boolean
  permittedActions: PermittedActions[]
}

export interface DeleteRoleResponse {
  roleId: string
}

export interface RoleState {
  role?: Role
  roleFetching: boolean
  roleError: stringOrNull
}

export interface ProductsState {
  products: List<Product>
  productsFetching: boolean
  productsError: stringOrNull
}

export interface PostRoleState {
  postRoleFetching: boolean
  postRoleError: stringOrNull
}

export interface PutRoleState {
  putRoleFetching: boolean
  putRoleError: stringOrNull
}

export interface DeleteRoleState {
  deleteRoleFetching: boolean
  deleteRoleError: stringOrNull
}

export interface RoleUsersState {
  roleUsers: List<User>
  roleUsersFetching: boolean
  roleUsersError: stringOrNull
}

export interface AllUsersState {
  allUsers: List<User>
  allUsersFetching: boolean
  allUsersError: stringOrNull
}

export interface UpdateAssignedUsersState {
  updateAssignedUsersFetching: boolean
  updateAssignedUsersError: stringOrNull
}

export interface RoleStateProperties
  extends RoleState,
    ProductsState,
    PostRoleState,
    PutRoleState,
    DeleteRoleState,
    RoleUsersState,
    AllUsersState,
    UpdateAssignedUsersState {
  roles: List<Role>
  rolesFetching: boolean
  getRolesError: stringOrNull

  filteredRoles: List<Role>
}

export interface PermissionFullId {
  product: string
  action: string
  permission: string | null
}

export interface NewRole {
  label: string
  description: string
  permittedActions: PermissionFullId[]
}

export interface RoleFormUsers {
  userById: Map<string, User>
  all: Set<string>
  currentlyAssigned: Set<string>
  toBeAssigned: Set<string>
  toBeUnassigned: Set<string>
}

export interface RoleForm {
  label: string
  description?: string
  isSystemRole?: boolean
  permissions: {
    [propName: string]: string
  }
  users: RoleFormUsers
  rowCheckboxes: {
    [propName: string]: boolean
  }
}

export interface UpdateAssignedUsersPayload {
  added: string[]
  removed: string[]
}

export type RoleManagementState = ImmutableMap<RoleStateProperties>

export interface RolesReceivedAction extends Action {
  type: RoleManagementActionType.GET_ROLES_SUCCESS
  payload: Role[]
}

export interface RolesFetchingAction extends Action {
  type: RoleManagementActionType.GET_ROLES_FETCHING
}

export interface GetRolesErrorAction extends Action {
  type: RoleManagementActionType.GET_ROLES_ERROR
  payload: string
}

export interface SearchRoleAction extends Action {
  type: RoleManagementActionType.SEARCH_ROLE
  payload: string
}

export interface GetRoleFetchingAction extends Action {
  type: RoleManagementActionType.GET_ROLE_FETCHING
}

export interface GetRoleSuccessAction extends Action {
  type: RoleManagementActionType.GET_ROLE_SUCCESS
  payload: Role
}

export interface GetRoleErrorAction extends Action {
  type: RoleManagementActionType.GET_ROLE_ERROR
  payload: string
}

export interface GetProductsFetchingAction extends Action {
  type: RoleManagementActionType.GET_PRODUCTS_FETCHING
}

export interface GetProductsSuccessAction extends Action {
  type: RoleManagementActionType.GET_PRODUCTS_SUCCESS
  payload: Product[]
}

export interface GetProductsErrorAction extends Action {
  type: RoleManagementActionType.GET_PRODUCTS_ERROR
  payload: string
}

export interface PostRolesFetchingAction extends Action {
  type: RoleManagementActionType.POST_ROLE_FETCHING
}

export interface PostRolesSuccessAction extends Action {
  type: RoleManagementActionType.POST_ROLE_SUCCESS
  payload: Role
}

export interface PostRolesErrorAction extends Action {
  type: RoleManagementActionType.POST_ROLE_ERROR
  payload: string
}

export interface PutRolesFetchingAction extends Action {
  type: RoleManagementActionType.PUT_ROLE_FETCHING
}

export interface PutRolesSuccessAction extends Action {
  type: RoleManagementActionType.PUT_ROLE_SUCCESS
  payload: Role
}

export interface PutRolesErrorAction extends Action {
  type: RoleManagementActionType.PUT_ROLE_ERROR
  payload: string
}

export interface DeleteRoleFetchingAction extends Action {
  type: RoleManagementActionType.DELETE_ROLE_FETCHING
}

export interface DeleteRoleSuccessAction extends Action {
  type: RoleManagementActionType.DELETE_ROLE_SUCCESS
  payload: Role
}

export interface DeleteRoleErrorAction extends Action {
  type: RoleManagementActionType.DELETE_ROLE_ERROR
  payload: string
}

export interface GetRoleUsersFetchingAction extends Action {
  type: RoleManagementActionType.GET_ROLE_USERS_FETCHING
}

export interface GetRoleUsersSuccessAction extends Action {
  type: RoleManagementActionType.GET_ROLE_USERS_SUCCESS
  payload: User[]
}

export interface GetRoleUsersErrorAction extends Action {
  type: RoleManagementActionType.GET_ROLE_USERS_ERROR
  payload: string
}

export interface GetAllUsersFetchingAction extends Action {
  type: RoleManagementActionType.GET_ALL_USERS_FETCHING
}

export interface GetAllUsersSuccessAction extends Action {
  type: RoleManagementActionType.GET_ALL_USERS_SUCCESS
  payload: User[]
}

export interface GetAllUsersErrorAction extends Action {
  type: RoleManagementActionType.GET_ALL_USERS_ERROR
  payload: string
}

export interface UpdateAssignedUsersFetchingAction extends Action {
  type: RoleManagementActionType.UPDATE_ASSIGNED_USERS_FETCHING
}

export interface UpdateAssignedUsersSuccessAction extends Action {
  type: RoleManagementActionType.UPDATE_ASSIGNED_USERS_SUCCESS
}

export interface UpdateAssignedUsersErrorAction extends Action {
  type: RoleManagementActionType.UPDATE_ASSIGNED_USERS_ERROR
  payload: string
}

export type RoleManagementActions =
  | RolesReceivedAction
  | RolesFetchingAction
  | GetRolesErrorAction
  | SearchRoleAction
  | GetRoleFetchingAction
  | GetRoleSuccessAction
  | GetRoleErrorAction
  | GetProductsFetchingAction
  | GetProductsSuccessAction
  | GetProductsErrorAction
  | PostRolesFetchingAction
  | PostRolesSuccessAction
  | PostRolesErrorAction
  | DeleteRoleFetchingAction
  | DeleteRoleSuccessAction
  | DeleteRoleErrorAction
  | PutRolesFetchingAction
  | PutRolesSuccessAction
  | PutRolesErrorAction
  | GetRoleUsersFetchingAction
  | GetRoleUsersSuccessAction
  | GetRoleUsersErrorAction
  | GetAllUsersFetchingAction
  | GetAllUsersSuccessAction
  | GetAllUsersErrorAction
  | UpdateAssignedUsersFetchingAction
  | UpdateAssignedUsersSuccessAction
  | UpdateAssignedUsersErrorAction
