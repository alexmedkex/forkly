import { AuthorizationController } from './AuthorizationController'

describe('AuthorizationController', () => {
  describe('checkRolePermissions', () => {
    it('should return undefined', async () => {
      const controller = new AuthorizationController()
      const res = await controller.checkRolePermissions('url', 'method', 'path', 'token')

      expect(res).toEqual()
    })
  })
})
