import { IRolePermittedActionResponse } from '@komgo/types'

export interface IPermittedActionsResponse {
  permissions: IRolePermittedActionResponse[] | undefined[]
}
