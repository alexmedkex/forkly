import { COUNTERPARTY_ERROR_CODE } from './CounterpartyErrorCode'
import { CounterpartyError } from './CounterpartyError'

describe('CounterpartyError', () => {
  it('should create an instance', () => {
    const err = new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, 'message')

    expect(err.errorCode).toBe(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST)
    expect(err.message).toBe('message')
  })

  it('should create an instance with default', () => {
    const err = new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST)

    expect(err.errorCode).toBe(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST)
    expect(err.message).toBe(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST.toString())
  })
})
