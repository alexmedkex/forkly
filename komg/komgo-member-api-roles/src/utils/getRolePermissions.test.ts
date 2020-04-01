const mockPermissionList = {
  'product1:actionId1': ['permitionId1'],
  'product:action': ['permission']
}
const error = jest.fn()
jest.mock('@komgo/logging', () => ({
  __esModule: true, // this property makes it work
  default: { error }
}))
jest.mock('@komgo/permissions', () => ({
  permissionsByProductAndAction: mockPermissionList
}))

import { getRolePermissions } from './getRolePermissions'

const roles = [
  {
    id: 'someRole',
    label: 'Role 1',
    description: 'Some description',
    permittedActions: [
      {
        permission: {
          id: 'permitionId1',
          label: 'Permition1'
        },
        action: {
          id: 'actionId1',
          label: 'action 1'
        },
        product: {
          id: 'product1',
          label: 'action 1'
        }
      },
      {
        permission: {
          id: 'permission',
          label: 'Permition2'
        },
        action: {
          id: 'action',
          label: 'action 2'
        },
        product: {
          id: 'product',
          label: 'action 2'
        }
      }
    ]
  }
]

const permissions = ['product1:actionId1:permitionId1', 'product:action:permission']

describe('getRolePermissions', () => {
  it('Returns permissions list', () => {
    const result = getRolePermissions(roles)
    expect(result).toEqual(permissions)
  })

  it('Returns empty array if no roles', () => {
    const result = getRolePermissions([])
    expect(result).toEqual([])
  })

  it("log an error if product or action doesn't exist in @komgo/permissions", () => {
    mockPermissionList['product1:actionId1'] = undefined
    getRolePermissions(roles)
    expect(error).toHaveBeenCalledWith(
      'EDAT02',
      'RoleHasInvalidAction',
      'Role has an invalid action product1:actionId1'
    )
  })

  it("log an error if permissions doesn't exist in @komgo/permissions", () => {
    mockPermissionList['product1:actionId1'] = ['error']
    getRolePermissions(roles)
    expect(error).toHaveBeenCalledWith(
      'EDAT02',
      'RoleHasInvalidPermission',
      'Role has an invalid permission product1:actionId1:permitionId1'
    )
  })
})
