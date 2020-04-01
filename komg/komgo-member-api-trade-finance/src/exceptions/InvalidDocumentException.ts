export default class InvalidDocumentException extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, InvalidDocumentException.prototype)
  }
}
