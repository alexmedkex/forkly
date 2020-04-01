export default class ContentNotFoundException extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ContentNotFoundException.prototype)
  }
}
