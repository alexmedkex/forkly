export class InvalidCompanyConfigurationError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidCompanyConfigurationError.prototype)
  }
}
