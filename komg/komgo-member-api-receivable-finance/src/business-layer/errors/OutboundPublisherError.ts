export class OutboundPublisherError extends Error {
  constructor(m: string) {
    super(m)

    Object.setPrototypeOf(this, OutboundPublisherError.prototype)
  }
}
