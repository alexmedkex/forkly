import { administration } from '@komgo/permissions'

import { isAuthorized } from './is-authorized'
import { PermittedActions } from '../features/role-management/store/types'

const canReadRoles: PermittedActions = {
  product: { id: administration.canReadRoles.product, label: administration.canReadRoles.product },
  action: { id: administration.canReadRoles.action, label: administration.canReadRoles.action },
  permission: {
    id: administration.canReadRoles.permission as string,
    label: administration.canReadRoles.permission as string
  }
}

const canCrudRoles: PermittedActions = {
  product: { id: administration.canCrudRoles.product, label: administration.canCrudRoles.product },
  action: { id: administration.canCrudRoles.action, label: administration.canCrudRoles.action },
  permission: {
    id: administration.canCrudRoles.permission as string,
    label: administration.canCrudRoles.permission as string
  }
}

describe('isAutorized', () => {
  it('should return true when is authorized', () => {
    const result = isAuthorized([canReadRoles], administration.canReadRoles)
    expect(result).toBe(true)
  })

  it('should return false', () => {
    const result = isAuthorized([canCrudRoles], {
      action: 'manageUserRoles',
      permission: 'create',
      product: 'administration'
    })
    expect(result).toBeFalsy()
  })

  it('should return true if permission is implicitly included in users role', () => {
    expect(isAuthorized([canCrudRoles], administration.canReadRoles)).toBe(true)
  })

  it('should return false if user has lower permissions', () => {
    expect(isAuthorized([canReadRoles], administration.canCrudRoles)).toBe(false)
  })
})
