import { PermissionsByRolesController } from './PermissionsByRolesController'
import { RoleDataAgent } from './__mocks__/RoleDataAgent'

describe('PermissionsByRolesController', () => {
  it('returns an array with non-existing role', async () => {
    const controller = new PermissionsByRolesController(new RoleDataAgent())
    const result = await controller.GetPermissions('someRole,someRole,someNonExistingRole')
    expect(result).toBeInstanceOf(Array)
  })
})
