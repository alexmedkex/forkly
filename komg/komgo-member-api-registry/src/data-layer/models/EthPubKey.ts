/**
 * NewEthPubKey Class
 * @export
 * @class NewEthPubKey
 */
export class EthPubKey {
  private lowPublicKey: string
  private highPublicKey: string
  private termDate: number
  private effDate: number
  private revoked: number

  constructor(publicKeyLow: string, publicKeyHigh: string, termDate: number, effDate: number, revoked: number) {
    this.lowPublicKey = publicKeyLow
    this.highPublicKey = publicKeyHigh
    this.termDate = termDate
    this.effDate = effDate
    this.revoked = revoked
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

  get effectiveDate(): number {
    return this.effDate
  }

  get isRevoked(): number {
    return this.revoked
  }
}
