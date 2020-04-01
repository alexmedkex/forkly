export class QuorumRequestError extends Error {
  constructor(m?: string, public readonly data?: any) {
    super(m)
    Object.setPrototypeOf(this, QuorumRequestError.prototype)
  }
}
