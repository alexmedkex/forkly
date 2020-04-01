export class LightContractLibraryConfigError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, LightContractLibraryConfigError.prototype)
  }
}
