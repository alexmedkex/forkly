export class CommonMessagingError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CommonMessagingError.prototype)
  }
}
