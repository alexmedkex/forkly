export default class DocumentMismatch extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DocumentMismatch.prototype)
  }
}
