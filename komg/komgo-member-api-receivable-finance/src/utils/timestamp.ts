export interface ITimestamp {
  createdAt: Date
  updatedAt: Date
}
export const timestamp = <T>(obj: T): T & ITimestamp => {
  const now = new Date()
  return {
    ...obj,
    createdAt: now,
    updatedAt: now
  }
}
