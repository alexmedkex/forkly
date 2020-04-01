import { ITrade, ICargo } from '@komgo/types'

export const withVaktId = <T extends ITrade | ICargo>(payload: T): T => ({
  ...payload,
  vaktId: (payload as any).sourceId
})
