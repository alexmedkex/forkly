export class InvalidAddressError extends Error {
  constructor(m: string, public readonly address: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidAddressError.prototype)
  }
}
