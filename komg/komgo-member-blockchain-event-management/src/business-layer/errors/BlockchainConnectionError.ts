export class BlockchainConnectionError extends Error {
  constructor(m?: string, public readonly data?: any) {
    super(m)
    Object.setPrototypeOf(this, BlockchainConnectionError.prototype)
  }
}
