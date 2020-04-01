import { Route, Post, Controller, Body, Security, Tags } from 'tsoa'

import { IRoleDataAgent } from '../../data-layer/data-agents/interfaces/IRoleDataAgent'
import { provide, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { getRolePermissions } from '../../utils'
import { IPermittedRequest } from '../request/is-permitted'
import { IIsPermittedResponse } from '../responses/IsPermittedResponse'

@Tags('Permissions')
@Route('is-permitted')
@provide(IsPermittedController)
export class IsPermittedController extends Controller {
  constructor(@inject(TYPES.RoleDataAgent) private readonly roleDataAgent: IRoleDataAgent) {
    super()
  }

  /**
   * @summary returns "isPermitted: true" given role name(s) includes given action/permission
   */
  @Security('internal')
  @Post()
  public async GetPermission(@Body() body: IPermittedRequest): Promise<IIsPermittedResponse> {
    const roleRecords = await this.roleDataAgent.getRolesById(body.roles)

    const rolePermissions = getRolePermissions(roleRecords)

    for (const possiblePermission of rolePermissions) {
      const roleIsPermitted = body.permissions.some((permission: string) => possiblePermission === permission)
      if (roleIsPermitted) {
        return { isPermitted: true }
      }
    }
    return { isPermitted: false }
  }
}
