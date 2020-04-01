import { ErrorCode } from '@komgo/error-utilities'

export class DataLayerError extends Error {
  constructor(m: string, public readonly errorCode: ErrorCode) {
    super(m)

    Object.setPrototypeOf(this, DataLayerError.prototype)
  }
}
