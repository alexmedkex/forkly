export default class InvalidActionReplyError extends Error {
  constructor(msg: string, public readonly rfpId: string = '') {
    super(msg)
    Object.setPrototypeOf(this, InvalidActionReplyError.prototype)
  }
}
