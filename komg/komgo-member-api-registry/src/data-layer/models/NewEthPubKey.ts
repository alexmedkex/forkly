/**
 * NewEthPubKey Class
 * @export
 * @class NewEthPubKey
 */
export class NewEthPubKey {
  private lowPublicKey: string
  private highPublicKey: string
  private termDate: number

  constructor(publicKeyLow: string, publicKeyHigh: string, termDate: number) {
    this.lowPublicKey = publicKeyLow
    this.highPublicKey = publicKeyHigh
    this.termDate = termDate
  }

  get publicKeyLow(): string {
    return this.lowPublicKey
  }

  get publicKeyHigh(): string {
    return this.highPublicKey
  }

  get terminationDate(): number {
    return this.termDate
  }
}
