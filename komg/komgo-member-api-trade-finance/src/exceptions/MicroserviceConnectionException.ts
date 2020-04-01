export default class MicroserviceConnectionException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MicroserviceConnectionException.prototype)
  }
}
