export class StopBlockNumberAlreadySetError extends Error {
  constructor(public readonly data?: any) {
    super('The private auto whitelist stop block number is already set')
    Object.setPrototypeOf(this, StopBlockNumberAlreadySetError.prototype)
  }
}
