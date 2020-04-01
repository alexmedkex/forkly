/**
 * TransactionSignResult Class
 * @export
 * @class TransactionSignResult
 */
export class TransactionSignResult {
  private txHash: string

  constructor(txHash: string) {
    this.txHash = txHash
  }

  get transactionHash(): string {
    return this.txHash
  }
}
