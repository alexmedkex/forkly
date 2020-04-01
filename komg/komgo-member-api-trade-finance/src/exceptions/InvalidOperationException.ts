export default class InvalidOperationException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidOperationException.prototype)
  }
}
