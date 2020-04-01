export default class MessagingError extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, MessagingError.prototype)
  }
}
