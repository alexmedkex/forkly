import { ErrorCode } from '@komgo/error-utilities'

export default class DatabaseError extends Error {
  constructor(m: string, public readonly errorCode: ErrorCode) {
    super(m)

    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}
