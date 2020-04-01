export default class DuplicatedItem extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, DuplicatedItem.prototype)
  }
}
