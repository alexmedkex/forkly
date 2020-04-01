export default class CacheNotReadyException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CacheNotReadyException.prototype)
  }
}
