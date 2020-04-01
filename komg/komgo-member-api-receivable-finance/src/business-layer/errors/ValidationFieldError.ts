import { IValidationErrors } from '@komgo/types'

export class ValidationFieldError extends Error {
  constructor(msg: string, public readonly validationErrors: IValidationErrors) {
    super(msg)

    Object.setPrototypeOf(this, ValidationFieldError.prototype)
  }
}
