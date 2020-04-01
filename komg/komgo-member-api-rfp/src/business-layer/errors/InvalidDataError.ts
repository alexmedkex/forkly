export default class InvalidDataError extends Error {
  constructor(msg: string, public readonly rfpId = 'unknown') {
    super(msg)
    Object.setPrototypeOf(this, InvalidDataError.prototype)
  }
}
