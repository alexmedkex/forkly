jest.mock('../../../utils/endpoints', () => ({
  ROLES_BASE_ENDPOINT: 'ROLES_BASE_ENDPOINT',
  USERS_BASE_ENDPOINT: 'USERS_BASE_ENDPOINT'
}))

import { Set } from 'immutable'

import {
  getRoles,
  getProducts,
  createRole,
  updateRole,
  deleteRole,
  getRoleUsers,
  getAllUsers,
  updateAssignedUsers
} from './actions'
import { initialState } from './reducer'
import { RoleManagementActionType } from './types'

describe('Role Management Actions', () => {
  let dispatchMock: any
  let apiMock: any
  const getState = (): any => initialState
  const httpGetAction = { type: '@http/API_GET_REQUEST' }
  const httpPostAction = { type: '@http/API_POST_REQUEST' }
  const httpPutAction = { type: '@http/API_PUT_REQUEST' }
  const httpPatchAction = { type: '@http/API_PATCH_REQUEST' }
  const httpDeleteAction = { type: '@http/API_DELETE_REQUEST' }
  const formValues: any = {
    label: 'role-name',
    description: 'description',
    permissions: {
      'kyc:kycAction': true,
      'lc:lcAction': 'lcPermission',
      'administration:userAdmin': false
    },
    users: {
      toBeAssigned: Set(['u1', 'u2']),
      toBeUnassigned: Set(['u3', 'u4'])
    }
  }
  const history: any = {
    replace: jest.fn()
  }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => httpGetAction),
      post: jest.fn(() => httpPostAction),
      put: jest.fn(() => httpPutAction),
      delete: jest.fn(() => httpDeleteAction),
      patch: jest.fn(() => httpPatchAction)
    }
  })

  describe('getRoles()', () => {
    it('calls api.get with correct arguments', () => {
      getRoles()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('ROLES_BASE_ENDPOINT/roles', {
        onSuccess: RoleManagementActionType.GET_ROLES_SUCCESS,
        onError: RoleManagementActionType.GET_ROLES_ERROR
      })
    })
  })

  describe('getProducts()', () => {
    it('calls api.get with correct arguments', () => {
      getProducts()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('ROLES_BASE_ENDPOINT/role-templates', {
        onSuccess: RoleManagementActionType.GET_PRODUCTS_SUCCESS,
        onError: RoleManagementActionType.GET_PRODUCTS_ERROR
      })
    })
  })

  describe('createRole()', () => {
    it('calls api.post with correct arguments', () => {
      createRole(formValues, history)(dispatchMock, getState, apiMock)

      expect(apiMock.post).toHaveBeenCalledWith('USERS_BASE_ENDPOINT/roles', {
        data: {
          description: 'description',
          label: 'role-name',
          permittedActions: [
            { action: 'kycAction', permission: null, product: 'kyc' },
            { action: 'lcAction', permission: 'lcPermission', product: 'lc' }
          ]
        },
        onSuccess: expect.any(Function),
        onError: RoleManagementActionType.POST_ROLE_ERROR
      })
    })
  })

  describe('updateRole()', () => {
    it('calls api.put with correct arguments', () => {
      updateRole('role-id-1', formValues, history)(dispatchMock, getState, apiMock)

      expect(apiMock.put).toHaveBeenCalledWith('USERS_BASE_ENDPOINT/roles/role-id-1', {
        data: {
          description: 'description',
          label: 'role-name',
          permittedActions: [
            { action: 'kycAction', permission: null, product: 'kyc' },
            { action: 'lcAction', permission: 'lcPermission', product: 'lc' }
          ]
        },
        onSuccess: expect.any(Function),
        onError: RoleManagementActionType.PUT_ROLE_ERROR
      })
    })
  })

  describe('deleteRole()', () => {
    it('calls api.delete with correct arguments', () => {
      deleteRole({ id: 'role-id-1' }, jest.fn())(dispatchMock, getState, apiMock)

      expect(apiMock.delete).toHaveBeenCalledWith('USERS_BASE_ENDPOINT/roles/role-id-1', {
        onSuccess: expect.any(Function),
        onError: RoleManagementActionType.DELETE_ROLE_ERROR
      })
    })
  })

  describe('getRoleUsers()', () => {
    it('calls api.get with correct arguments', () => {
      getRoleUsers('role-id-1')(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('USERS_BASE_ENDPOINT/roles/role-id-1/users', {
        onSuccess: RoleManagementActionType.GET_ROLE_USERS_SUCCESS,
        onError: expect.any(Function)
      })
    })
  })

  describe('getAllUsers()', () => {
    it('calls api.get with correct arguments', () => {
      getAllUsers()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('USERS_BASE_ENDPOINT/users', {
        onSuccess: RoleManagementActionType.GET_ALL_USERS_SUCCESS,
        onError: RoleManagementActionType.GET_ALL_USERS_ERROR
      })
    })
  })

  describe('updateAssignedUsers()', () => {
    it('calls api.patch with correct arguments', () => {
      updateAssignedUsers('role-id-1', formValues, history, 'successMessage')(dispatchMock, getState, apiMock)

      expect(apiMock.patch).toHaveBeenCalledWith('USERS_BASE_ENDPOINT/roles/role-id-1/assigned-users', {
        data: {
          added: ['u1', 'u2'],
          removed: ['u3', 'u4']
        },
        onSuccess: expect.any(Function),
        onError: RoleManagementActionType.UPDATE_ASSIGNED_USERS_ERROR
      })
    })
  })
})
