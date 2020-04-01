import { IRolePermittedActionResponse } from '@komgo/types'
import { Controller, Get, Query, Route, Security, Tags } from 'tsoa'

import { IRoleDataAgent } from '../../data-layer/data-agents/interfaces/IRoleDataAgent'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

@Tags('Permissions')
@Route('permissions-by-roles')
@provide(PermissionsByRolesController)
export class PermissionsByRolesController extends Controller {
  constructor(@inject(TYPES.RoleDataAgent) private readonly roleDataAgent: IRoleDataAgent) {
    super()
  }

  /**
   * @summary returns a list permissions by given role names
   */
  @Security('signedIn')
  @Get()
  public async GetPermissions(@Query('roles') rolesQuery: string): Promise<IRolePermittedActionResponse[]> {
    const roles = rolesQuery.split(',')
    return this.roleDataAgent.getPermissionsByRoles(roles)
  }
}
