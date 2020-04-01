export default class NoActionsForRequestError extends Error {
  constructor(msg: string, public readonly rfpId: string) {
    super(msg)
    Object.setPrototypeOf(this, NoActionsForRequestError.prototype)
  }
}
