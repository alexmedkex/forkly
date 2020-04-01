/**
 * TransactionSignResult Class
 * @export
 * @class TransactionSignResult
 */
export class TransactionData {
  private payloadData: string
  private contract: string

  constructor(contractAddress: string, payloadData: string) {
    this.contract = contractAddress
    this.payloadData = payloadData
  }

  get payload(): string {
    return this.payloadData
  }

  get contractAddress(): string {
    return this.contract
  }
}
