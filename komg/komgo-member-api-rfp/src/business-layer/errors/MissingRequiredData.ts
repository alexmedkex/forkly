export default class MissingRequiredData extends Error {
  constructor(m?: string) {
    super(m)

    Object.setPrototypeOf(this, MissingRequiredData.prototype)
  }
}
