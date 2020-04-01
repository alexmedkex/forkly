export default class MissingEventProcessor extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MissingEventProcessor.prototype)
  }
}
