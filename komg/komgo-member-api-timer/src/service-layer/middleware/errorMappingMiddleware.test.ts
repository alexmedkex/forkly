import { errorMappingMiddleware } from './errorMappingMiddleware'
import { ErrorCode } from '@komgo/error-utilities'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
describe('errorMappingMiddleware', () => {
  it('should delegate if no error', () => {
    const next = jest.fn()
    errorMappingMiddleware(null, null, null, next)

    expect(next).toHaveBeenCalledWith(null)
  })

  it('should process INVALID_DATA timerDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'INVALID_DATA', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process NOT_FOUND timerDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'NOT_FOUND', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process DUPLICATE_KEY timerDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.DUPLICATE_KEY, 'DUPLICATE_KEY', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process GENERAL_ERROR timerDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.GENERAL_ERROR, 'GENERAL_ERROR', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
