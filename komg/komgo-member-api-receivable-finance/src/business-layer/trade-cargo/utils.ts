import { ITradeSnapshot } from '@komgo/types'

export const createCleanSnapshot = (
  original: ITradeSnapshot,
  overrides: Partial<ITradeSnapshot> = {}
): ITradeSnapshot => {
  const updatedTradeSnapshot: ITradeSnapshot = {
    ...original,
    ...overrides
  }
  delete updatedTradeSnapshot.createdAt
  delete updatedTradeSnapshot.updatedAt
  return updatedTradeSnapshot
}
