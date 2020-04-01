import { IRolePermittedActionResponse, IRolePermittedActionRequest } from '@komgo/types'

import { IRoleDocument } from '../../models/role'

export interface IRoleDataAgent {
  createRole(data: IRoleDocument): Promise<IRoleDocument>
  getRole(id: string): Promise<IRoleDocument>
  getRoles(permittedAction?: IRolePermittedActionRequest): Promise<IRoleDocument[]>
  getPermissionsByRoles(roles: string[]): Promise<IRolePermittedActionResponse[]>
  getRolesById(ids: string[]): Promise<IRoleDocument[]>
  updateRole(id: string, data: IRoleDocument): Promise<IRoleDocument>
  removeRole(id: string): Promise<void>
}
