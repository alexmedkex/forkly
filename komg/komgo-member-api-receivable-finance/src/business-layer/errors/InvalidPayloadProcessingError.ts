export class InvalidPayloadProcessingError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, InvalidPayloadProcessingError.prototype)
  }
}
