export default class InvalidType extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, InvalidType.prototype)
  }
}
