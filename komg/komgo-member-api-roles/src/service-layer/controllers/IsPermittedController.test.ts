const mockPermissionList = {
  'product1:actionId1': ['permitionId1'],
  'product:action': ['permission']
}
jest.mock('@komgo/permissions', () => ({
  permissionsByProductAndAction: mockPermissionList
}))
const error = jest.fn()
jest.mock('@komgo/logging', () => ({
  __esModule: true, // this property makes it work
  default: { error },
  getLogger: jest.fn()
}))

import { RoleDataAgent } from './__mocks__/RoleDataAgent'
import { IsPermittedController } from './IsPermittedController'

describe('IsePermittedController', () => {
  it('Returns proper result for true', async () => {
    const controller = new IsPermittedController(new RoleDataAgent(false))
    const result = await controller.GetPermission({ roles: ['someRole'], permissions: ['product:action:permission'] })
    expect(result.isPermitted).toEqual(true)
  })

  it('Returns faulty result for false', async () => {
    const controller = new IsPermittedController(new RoleDataAgent(false))
    const result = await controller.GetPermission({
      roles: ['someRole'],
      permissions: ['nonExistingProduct:action:permission']
    })
    expect(result.isPermitted).toEqual(false)
  })

  it('Returns false for zero roles', async () => {
    const controller = new IsPermittedController(new RoleDataAgent(true))
    const result = await controller.GetPermission({ roles: [''], permissions: ['product:action:permission'] })
    expect(result.isPermitted).toEqual(false)
  })

  it('Returns ignores non-existing roles', async () => {
    const controller = new IsPermittedController(new RoleDataAgent(false))
    const result = await controller.GetPermission({
      roles: ['someNonExistingRole1', 'someRole'],
      permissions: ['product:action:permission']
    })
    expect(result.isPermitted).toEqual(true)
  })

  it("Returns false if role doesn't exist", async () => {
    const controller = new IsPermittedController(new RoleDataAgent(true))
    const result = await controller.GetPermission({
      roles: ['someNonExistingRole1', 'someNonExistingRole2'],
      permissions: ['product:action:permission']
    })
    expect(result.isPermitted).toEqual(false)
  })

  it("log an error if product or action doesn't exist in @komgo/permissions", async () => {
    mockPermissionList['product1:actionId1'] = undefined
    const controller = new IsPermittedController(new RoleDataAgent(false))

    await controller.GetPermission({
      roles: ['someRole'],
      permissions: ['product:action:permission']
    })
    expect(error).toHaveBeenCalledWith(
      'EDAT02',
      'RoleHasInvalidAction',
      'Role has an invalid action product1:actionId1'
    )
  })

  it("log an error if permission doesn't exists in @komgo/permissions", async () => {
    mockPermissionList['product1:actionId1'] = ['error']
    const controller = new IsPermittedController(new RoleDataAgent(false))

    await controller.GetPermission({
      roles: ['someRole'],
      permissions: ['product:action:permission']
    })
    expect(error).toHaveBeenCalledWith(
      'EDAT02',
      'RoleHasInvalidPermission',
      'Role has an invalid permission product1:actionId1:permitionId1'
    )
  })
})
