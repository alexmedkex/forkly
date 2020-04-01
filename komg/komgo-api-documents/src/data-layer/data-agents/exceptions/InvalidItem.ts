export default class InvalidItem extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidItem.prototype)
  }
}
