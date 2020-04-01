export default class BlockchainConnectionException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BlockchainConnectionException.prototype)
  }
}
