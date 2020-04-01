export default class InvalidMessageTypeError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, InvalidMessageTypeError.prototype)
  }
}
