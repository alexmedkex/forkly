import 'reflect-metadata'
import { IRoleRequest } from '../request/role'
import { IRoleResponse, IRolesResponse } from '../responses/role'
import { RolesController } from './RolesController'
import { mockRequests, RoleDataAgent, rolesMock } from './__mocks__/RoleDataAgent'

describe('RolesController', () => {
  let controller: RolesController
  beforeEach(() => {
    const roleDataAgent: any = new RoleDataAgent()
    controller = new RolesController(roleDataAgent)
  })

  describe('GetRoles()', () => {
    it('should return RoleModel[] instance', async () => {
      const result: IRoleResponse[] = await controller.GetRoles()
      expect(result).toEqual(rolesMock)
    })

    it('should return RoleModel[] instance with filter by productId, actionId', async () => {
      const result: IRoleResponse[] = await controller.GetRoles('someProdId', 'someActionId')
      expect(result).toEqual(rolesMock)
    })

    it('should throw an error 422 status', async () => {
      let status
      try {
        await controller.GetRoles(undefined, 'someActionId')
      } catch (e) {
        status = e.status
      }
      expect(status).toEqual(422)
    })
  })

  describe('GetRoleById()', () => {
    it('should return RoleModel instance', async () => {
      const result: IRoleResponse = await controller.GetRole(rolesMock[0].id)
      expect(result).toEqual(rolesMock[0])
    })
  })

  describe('CreateRoles()', () => {
    it('should return RoleModel instance', async () => {
      const result: IRoleResponse = await controller.CreateRoles(mockRequests[0] as IRoleRequest)
      expect(result).toEqual(rolesMock[0])
    })
  })

  describe('PutRole()', () => {
    it('should update role on /{id}', async () => {
      const result: IRoleResponse = await controller.PutRole('someRole', mockRequests[0] as IRoleRequest)
      expect(result).toEqual(rolesMock[0])
    })
    it('should throw an error 409 status', async () => {
      let status
      try {
        await controller.PutRole('role2Id', mockRequests[1] as IRoleRequest)
      } catch (e) {
        status = e.status
      }
      expect(status).toEqual(409)
    })
  })

  describe('DeleteRole()', () => {
    it('should deletes role on /{id}', async () => {
      const result = await controller.DeleteRole('someRole')
      expect(result).toEqual(rolesMock[0])
    })
    it('should throw an error 409 status', async () => {
      let status
      try {
        await controller.DeleteRole('role2Id')
      } catch (e) {
        status = e.status
      }
      expect(status).toEqual(409)
    })
  })
})
