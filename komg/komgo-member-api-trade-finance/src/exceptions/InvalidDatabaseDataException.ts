export default class InvalidDatabaseDataException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidDatabaseDataException.prototype)
  }
}
