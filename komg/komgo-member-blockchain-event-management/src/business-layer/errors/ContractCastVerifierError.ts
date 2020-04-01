export class ContractCastVerifierError extends Error {
  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, ContractCastVerifierError.prototype)
  }
}
