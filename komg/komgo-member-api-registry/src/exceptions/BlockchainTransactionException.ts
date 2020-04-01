export default class BlockchainTransactionException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BlockchainTransactionException.prototype)
  }
}
