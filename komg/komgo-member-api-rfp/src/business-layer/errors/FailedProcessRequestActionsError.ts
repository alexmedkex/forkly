export default class FailedProcessRequestActionsError extends Error {
  constructor(msg: string, public readonly rfpId = 'unknown') {
    super(msg)
    Object.setPrototypeOf(this, FailedProcessRequestActionsError.prototype)
  }
}
