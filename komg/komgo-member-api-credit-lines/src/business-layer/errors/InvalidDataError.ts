export default class InvalidDataError extends Error {
  constructor(msg: string, public readonly data?: any) {
    super(msg)
    this.data = data
    Object.setPrototypeOf(this, InvalidDataError.prototype)
  }
}
