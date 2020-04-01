export class ContractNotFoundError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ContractNotFoundError.prototype)
  }
}
