export class MicroserviceClientError extends Error {
  constructor(m?: string, public readonly data?: any) {
    super(m)

    Object.setPrototypeOf(this, MicroserviceClientError.prototype)
  }
}
