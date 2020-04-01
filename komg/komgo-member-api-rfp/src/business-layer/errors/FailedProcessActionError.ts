export default class FailedProcessActionError extends Error {
  constructor(msg?: string, public readonly rfpId = 'unknown') {
    super(msg)
    Object.setPrototypeOf(this, FailedProcessActionError.prototype)
  }
}
