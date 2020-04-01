export default class InvalidOperation extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidOperation.prototype)
  }
}
