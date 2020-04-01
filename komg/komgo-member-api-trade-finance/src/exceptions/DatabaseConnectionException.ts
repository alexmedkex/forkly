export default class DatabaseConnectionException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DatabaseConnectionException.prototype)
  }
}
