/**
 * Error that is thrown is there is a permanent
 * problem with processing a particular message.
 *
 * For example, it is thrown if a message has incorrect format.
 */
export default class InvalidMessage extends Error {
  constructor(msg: string) {
    super(msg)

    Object.setPrototypeOf(this, InvalidMessage.prototype)
  }
}
