import { IRolePermittedActionRequest } from '@komgo/types'

export interface IRoleRequestWithoutLabel {
  description?: string
  permittedActions?: IRolePermittedActionRequest[]
}
