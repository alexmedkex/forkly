import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

const mockFindRoute = jest.fn(() => 'path1')
const mockFetchCachedSwaggerJSON = jest.fn(async () => ({
  basePath: '',
  paths: { path1: { method1: { security: [{ signedIn: [] }] } } }
}))

jest.mock('../../utils/findSwaggerRouteByPath', () => ({
  findSwaggerRouteByPath: mockFindRoute
}))
jest.mock('../../utils/fetchSwaggerJSON', () => ({
  fetchCachedSwaggerJSON: mockFetchCachedSwaggerJSON
}))

import swaggerDataMiddleware from './swaggerData'

const req = { query: { baseUrl: 'http://servername', method: 'method1', path: 'path1' } }
let nextMock
let respMock
let respJsonMock
let respEndMock
let originalAllowSwaggerAccess

describe('swaggerDataMiddleware', () => {
  beforeEach(() => {
    originalAllowSwaggerAccess = process.env.ALLOW_SWAGGER_ACCESS
    respEndMock = jest.fn()
    respJsonMock = jest.fn(() => ({
      end: respEndMock
    }))
    respMock = {
      status: jest.fn(() => ({
        json: respJsonMock,
        end: respEndMock
      })),
      end: respEndMock
    }
    nextMock = jest.fn()
  })

  afterEach(() => {
    process.env.ALLOW_SWAGGER_ACCESS = originalAllowSwaggerAccess
  })

  it('should throw Error if internal permission', async () => {
    mockFetchCachedSwaggerJSON.mockImplementationOnce(async () => ({
      basePath: '',
      paths: { path1: { method1: { security: [{ internal: [] }] } } }
    }))
    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(nextMock).toHaveBeenCalledWith(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
  })

  it('should return 204 if public permission', async () => {
    mockFetchCachedSwaggerJSON.mockImplementationOnce(async () => ({
      basePath: '',
      paths: { path1: { method1: { security: [{ public: [] }] } } }
    }))
    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(respMock.status).toBeCalledWith(204)
  })

  it('should throw an Error if fetchCachedSwaggerJSON() fails', async () => {
    mockFetchCachedSwaggerJSON.mockImplementationOnce(() => Promise.reject(new Error('500')))
    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(nextMock).toHaveBeenCalledWith(new Error('500'))
  })

  it('should call findSwaggerRouteByPath', async () => {
    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(mockFetchCachedSwaggerJSON).toHaveBeenCalledWith('http://servername')
  })

  it('should call next() on success', async () => {
    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(nextMock).toHaveBeenCalledTimes(1)
  })

  it('should call next with 404 status if path not found', async () => {
    mockFindRoute.mockImplementationOnce(() => null)

    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(nextMock).toHaveBeenCalledWith(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
  })

  it('should call next with code: "ECONNREFUSED"', async () => {
    mockFetchCachedSwaggerJSON.mockImplementationOnce(() => Promise.reject({ code: 'ECONNREFUSED' }))

    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(nextMock).toBeCalledWith({ code: 'ECONNREFUSED' })
  })

  it('should return 403 on routes without security annotations', async () => {
    mockFetchCachedSwaggerJSON.mockImplementationOnce(async () => ({
      basePath: '',
      paths: { path1: { method1: { security: [] } } }
    }))

    await swaggerDataMiddleware(req, respMock, nextMock)

    expect(nextMock).toHaveBeenCalledWith(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
  })

  it('should return 405 on invalid methods', async () => {
    const reqNoMethod = { query: { baseUrl: 'http://servername', method: 'method2', path: 'path1' } }
    await swaggerDataMiddleware(reqNoMethod, respMock, nextMock)

    expect(nextMock).toHaveBeenCalledWith(
      ErrorUtils.methodNotAllowedException(ErrorCode.Authorization, 'Method Not Allowed')
    )
  })

  it('should return 204 on /swagger.json request', async () => {
    process.env.ALLOW_SWAGGER_ACCESS = 'true'
    const newReq = { query: { ...req.query, path: '/swagger.json' } }

    await swaggerDataMiddleware(newReq, respMock, nextMock)

    expect(respMock.status).toBeCalledWith(204)
  })

  it('should return 403 on /swagger.json request if ALLOW_SWAGGER_ACCESS != true', async () => {
    process.env.ALLOW_SWAGGER_ACCESS = ''
    const newReq = { query: { ...req.query, path: '/swagger.json' } }

    await swaggerDataMiddleware(newReq, respMock, nextMock)

    expect(nextMock).toBeCalledWith(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
  })
})
