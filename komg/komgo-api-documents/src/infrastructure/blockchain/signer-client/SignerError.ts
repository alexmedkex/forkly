export default class SignerError extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, SignerError.prototype)
  }
}
