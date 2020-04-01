import { ErrorCode } from '@komgo/error-utilities'
import { IValidationErrors } from '@komgo/microservice-config'

export class ValidationError extends Error {
  constructor(msg: string, public readonly errorCode: ErrorCode, public readonly validationErrors: IValidationErrors) {
    super(msg)

    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}