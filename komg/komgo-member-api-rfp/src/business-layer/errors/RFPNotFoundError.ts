export default class RFPNotFoundError extends Error {
  constructor(msg: string, public readonly rfpId: string = '') {
    super(msg)
    Object.setPrototypeOf(this, RFPNotFoundError.prototype)
  }
}
