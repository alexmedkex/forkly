export default class OutboundMessageCreateError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, OutboundMessageCreateError.prototype)
  }
}
