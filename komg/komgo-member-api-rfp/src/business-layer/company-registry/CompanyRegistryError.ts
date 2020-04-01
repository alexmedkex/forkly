export default class CompanyRegistryError extends Error {
  constructor(m?: string, public readonly data?: any) {
    super(m)

    Object.setPrototypeOf(this, CompanyRegistryError.prototype)
  }
}
