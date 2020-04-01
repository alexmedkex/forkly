export enum DATA_ACCESS_ERROR {
  NOT_FOUND,
  INVALID_DATA,
  DUPLICATE_KEY
}
export class DataAccessException extends Error {
  error: DATA_ACCESS_ERROR
  data: { [name: string]: string[] }
  constructor(error: DATA_ACCESS_ERROR, msg: string, data?: { [name: string]: string[] }) {
    super(msg)
    this.error = error
    this.data = data
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DataAccessException.prototype)
  }
}
