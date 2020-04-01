import { errorMappingMiddleware } from './errorMappingMiddleware'
import { ErrorCode } from '@komgo/error-utilities'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
import { QueryFilterException } from '@komgo/data-access'
import { ValidationError } from '../../business-layer/errors/ValidationError'
import { NotificationException } from '../../business-layer/notifications/NotificationException'
describe('errorMappingMiddleware', () => {
  it('should delegate if no error', () => {
    const next = jest.fn()
    errorMappingMiddleware(null, null, null, next)

    expect(next).toHaveBeenCalledWith(null)
  })

  it('should process INVALID_DATA creditLinesDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'INVALID_DATA', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process NOT_FOUND creditLinesDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'NOT_FOUND', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process DUPLICATE_KEY creditLinesDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.DUPLICATE_KEY, 'DUPLICATE_KEY', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should process GENERAL_ERROR creditLinesDataAgent error', () => {
    const next = jest.fn()
    const err = new DataAccessException(DATA_ACCESS_ERROR.GENERAL_ERROR, 'GENERAL_ERROR', null)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should proccess validation query string error', () => {
    const next = jest.fn()
    const err = new QueryFilterException('validation error')
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should proccess validation error', () => {
    const next = jest.fn()
    const err = new ValidationError('validation error', ErrorCode.DatabaseInvalidData, {
      companyIds: ['Credit line request for companies already exists']
    })
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should proccess notification error', () => {
    const next = jest.fn()
    const err = new NotificationException('error', ErrorCode.ValidationInvalidOperation)
    errorMappingMiddleware(err, null, null, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
