export default class ItemNotFound extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ItemNotFound.prototype)
  }
}
