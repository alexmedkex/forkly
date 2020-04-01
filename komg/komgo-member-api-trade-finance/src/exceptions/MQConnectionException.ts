export default class MQConnectionException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MQConnectionException.prototype)
  }
}
