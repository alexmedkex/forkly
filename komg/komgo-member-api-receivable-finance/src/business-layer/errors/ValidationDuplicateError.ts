export class ValidationDuplicateError extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, ValidationDuplicateError.prototype)
  }
}
