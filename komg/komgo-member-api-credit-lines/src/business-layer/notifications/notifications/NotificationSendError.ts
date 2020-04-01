export default class NotificationSendError extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, NotificationSendError.prototype)
  }
}
