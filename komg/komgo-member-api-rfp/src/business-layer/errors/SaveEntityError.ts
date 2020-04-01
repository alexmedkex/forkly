export default class SaveEntityError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, SaveEntityError.prototype)
  }
}
