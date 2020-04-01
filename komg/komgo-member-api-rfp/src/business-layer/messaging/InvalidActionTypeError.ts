export default class InvalidActionTypeError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, InvalidActionTypeError.prototype)
  }
}
