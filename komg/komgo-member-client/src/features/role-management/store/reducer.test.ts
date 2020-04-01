import { List } from 'immutable'

import reducer, { initialState } from './reducer'
import { RoleManagementActionType } from './types'

const roles: any = List([
  { id: 'admin', label: 'admin' },
  { id: 'kyc', label: 'kyc' },
  { id: 'officer', label: 'officer', description: 'KYC Officer' }
])
const products: any = List([{ id: 'p1', label: 'Product 2' }, { id: 'p2', label: 'Product 2' }])

describe('Role Management Reducer', () => {
  // get roles
  it('saves roles to store on GET_ROLES_SUCCESS', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_ROLES_SUCCESS,
      payload: roles
    })

    expect(state.get('roles')).toEqual(roles)
  })

  it('sets rolesFetcthing to true on GET_ROLES_FETCHING', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_ROLES_FETCHING
    })

    expect(state.get('rolesFetching')).toEqual(true)
  })

  it('sets getRolesError on GET_ROLES_ERROR', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_ROLES_ERROR,
      payload: 'error message'
    })

    expect(state.get('getRolesError')).toEqual('error message')
  })

  // get role
  it('saves role to store on GET_ROLE_SUCCESS', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_ROLE_SUCCESS,
      payload: roles.get(0)
    })

    expect(state.get('role')).toEqual(roles.get(0))
  })

  it('sets roleFetcthing to true on GET_ROLE_FETCHING', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_ROLE_FETCHING
    })

    expect(state.get('roleFetching')).toEqual(true)
  })

  it('sets roleError on GET_ROLE_ERROR', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_ROLE_ERROR,
      payload: 'error message'
    })

    expect(state.get('roleError')).toEqual('error message')
  })

  // get products
  it('saves products to store on GET_PRODUCTS_SUCCESS', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_PRODUCTS_SUCCESS,
      payload: products
    })

    expect(state.get('products')).toEqual(products)
  })

  it('sets productsFetching to true on GET_PRODUCTS_FETCHING', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_PRODUCTS_FETCHING
    })

    expect(state.get('productsFetching')).toEqual(true)
  })

  it('sets productsError on GET_PRODUCTS_ERROR', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.GET_PRODUCTS_ERROR,
      payload: 'error message'
    })

    expect(state.get('productsError')).toEqual('error message')
  })

  // post role
  it('adds new role to state on POST_ROLE_SUCCESS', () => {
    const role: any = { id: 'newRole', label: 'new role' }
    const state = reducer(initialState.set('roles', roles), {
      type: RoleManagementActionType.POST_ROLE_SUCCESS,
      payload: role
    })

    expect(state.get('roles').get(3)).toEqual(role)
  })

  it('sets postRoleFetching to true on POST_ROLE_FETCHING', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.POST_ROLE_FETCHING
    })

    expect(state.get('postRoleFetching')).toEqual(true)
  })

  it('sets postRoleError on POST_ROLE_ERROR', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.POST_ROLE_ERROR,
      payload: 'error message'
    })

    expect(state.get('postRoleError')).toEqual('error message')
  })

  // put role
  it('updates role in the state on PUT_ROLE_SUCCESS', () => {
    const role: any = { id: 'kyc', label: 'New label' }
    const state = reducer(initialState.set('roles', roles), {
      type: RoleManagementActionType.PUT_ROLE_SUCCESS,
      payload: role
    })

    expect(state.get('roles').get(1)).toEqual(role)
  })

  it('sets putRoleFetching to true on PUT_ROLE_FETCHING', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.PUT_ROLE_FETCHING
    })

    expect(state.get('putRoleFetching')).toEqual(true)
  })

  it('sets putRoleError on PUT_ROLE_ERROR', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.PUT_ROLE_ERROR,
      payload: 'error message'
    })

    expect(state.get('putRoleError')).toEqual('error message')
  })

  // delete role
  it('deletes role from the state on DELETE_ROLE_SUCCESS', () => {
    const role: any = { id: 'kyc', label: 'KYC' }
    const state = reducer(initialState.set('roles', roles), {
      type: RoleManagementActionType.DELETE_ROLE_SUCCESS,
      payload: role
    })

    expect(state.get('roles').size).toEqual(2)
    expect(state.get('roles').get(1)).toEqual(roles.get(2))
  })

  it('sets deleteRoleFetching to true on DELETE_ROLE_FETCHING', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.DELETE_ROLE_FETCHING
    })

    expect(state.get('deleteRoleFetching')).toEqual(true)
  })

  it('sets deleteRoleError on DELETE_ROLE_ERROR', () => {
    const state = reducer(initialState, {
      type: RoleManagementActionType.DELETE_ROLE_ERROR,
      payload: 'error message'
    })

    expect(state.get('deleteRoleError')).toEqual('error message')
  })
})
