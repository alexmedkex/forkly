export default class RegistryError extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, RegistryError.prototype)
  }
}
