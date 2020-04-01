import { IRolePermissionResponse } from '@komgo/types'

export interface IActionPermissionsResponse {
  id?: string
  label?: string
  permissions?: IRolePermissionResponse[]
}

export interface IProductActionsResponse {
  id?: string
  label?: string
  actions?: IActionPermissionsResponse[]
}
