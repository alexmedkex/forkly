import { COUNTERPARTY_ERROR_CODE } from './CounterpartyErrorCode'

export class CounterpartyError extends Error {
  data: { [name: string]: string[] }
  constructor(public errorCode: COUNTERPARTY_ERROR_CODE, message: string = null, data?: { [name: string]: string[] }) {
    super(message || errorCode.toString())

    this.name = this.constructor.name
    this.data = data
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor)
  }
}
