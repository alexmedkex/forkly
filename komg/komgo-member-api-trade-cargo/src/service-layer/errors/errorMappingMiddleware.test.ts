import { errorMappingMiddleware } from './errorMappingMiddleware'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
describe('errorMappingMiddleware', () => {
  it('should delegate if no error', () => {
    const next = jest.fn()
    errorMappingMiddleware(null, null, null, next)

    expect(next).toHaveBeenCalledWith(null)
  })

  it('should delegate if Common error', () => {
    const next = jest.fn()
    const err = new Error()
    errorMappingMiddleware(err, null, null, next)

    expect(next).toHaveBeenCalledWith(err)
  })

  describe('DataAccessError', () => {
    it('processes NOT_FOUND', () => {
      const next = jest.fn()
      const err = new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'msg')
      errorMappingMiddleware(err, null, null, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: err.message
        })
      )
    })

    it('processes INVALID_DATA', () => {
      const next = jest.fn()
      const err = new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'msg')
      errorMappingMiddleware(err, null, null, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: err.message
        })
      )
    })

    it('processes DUPLICATE_KEY', () => {
      const next = jest.fn()
      const err = new DataAccessException(DATA_ACCESS_ERROR.DUPLICATE_KEY, 'msg')
      errorMappingMiddleware(err, null, null, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: err.message
        })
      )
    })
  })
})
