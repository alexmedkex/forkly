export default class FailedProcessReplyActionError extends Error {
  constructor(msg?: string, public readonly rfpId = 'unknown') {
    super(msg)
    Object.setPrototypeOf(this, FailedProcessReplyActionError.prototype)
  }
}
