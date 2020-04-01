import { errorMappingMiddleware } from './errorMappingMiddleware'
import { CounterpartyError } from '../../business-layer/errors/CounterpartyError'
import { COUNTERPARTY_ERROR_CODE } from '../../business-layer/errors/CounterpartyErrorCode'
import { ErrorCode } from '@komgo/error-utilities'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
describe('errorMappingMiddleware', () => {
  it('should delegate if no error', () => {
    const next = jest.fn()
    errorMappingMiddleware(null, null, null, next)

    expect(next).toHaveBeenCalledWith(null)
  })

  it('should delegate if no conterpary error', () => {
    const next = jest.fn()
    const err = new Error()
    errorMappingMiddleware(err, null, null, next)

    expect(next).toHaveBeenCalledWith(err)
  })

  it('should process counterparty error', () => {
    const next = jest.fn()
    const err = new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process coverageDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'INVALID_DATA', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
