export class MessageTooLargeError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MessageTooLargeError.prototype)
  }
}
