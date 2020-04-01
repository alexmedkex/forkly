export default class DuplicateDocumentException extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, DuplicateDocumentException.prototype)
  }
}
