const isLmsNodeMock = jest.fn(() => true)
jest.mock('../../utils/isLmsNode', () => ({
  isLmsNode: isLmsNodeMock
}))
const getTenantIdFromTokenMock = jest.fn(() => 'tenantIdFromToken')
const decodedToken = { sub: 'userId' }
const getTokenFromAuthHeaderMock = jest.fn(() => decodedToken)
jest.mock('../../utils/token', () => ({
  getTenantIdFromToken: getTenantIdFromTokenMock,
  getTokenFromAuthHeader: getTokenFromAuthHeaderMock
}))

const keycloakInstance = { keycloak: true }
const memoizedKeycloakMock = jest.fn(() => Promise.resolve(keycloakInstance))
jest.mock('./keycloak', () => ({
  memoizedKeycloak: memoizedKeycloakMock
}))

import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

import { komgoContextMiddleware } from './komgoContext'

describe('komgoContextMiddleware', () => {
  process.env.KEYCLOAK_REALM_NAME = 'realmName'
  process.env.COMPANY_STATIC_ID = 'companyStaticIdFromEnv'

  let request
  let response
  let next

  beforeEach(() => {
    request = {
      komgoContext: {},
      get: jest.fn(() => 'authHeader')
    }
    response = {
      set: jest.fn()
    }
    next = jest.fn()
  })

  it('should call next if Authorization header is empty', async () => {
    request.get.mockReturnValueOnce('')

    await komgoContextMiddleware(request, response, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('should throw error if token is invalid', async () => {
    getTokenFromAuthHeaderMock.mockImplementationOnce(() => {
      throw new Error('oops')
    })

    await komgoContextMiddleware(request, response, next)

    expect(next).toHaveBeenCalledWith(ErrorUtils.forbiddenException(ErrorCode.Authorization, 'Invalid JWT'))
  })

  it('should call memoizedKeycloak with static ID for LMS nodes', async () => {
    isLmsNodeMock.mockReturnValue(true)
    getTenantIdFromTokenMock.mockReturnValueOnce('lmsStaticId')

    await komgoContextMiddleware(request, response, next)

    expect(memoizedKeycloakMock).toHaveBeenCalledWith('lmsStaticId')
  })

  it('should call memoizedKeycloak with a realm name from env vars for non-LMS nodes', async () => {
    isLmsNodeMock.mockReturnValue(false)

    await komgoContextMiddleware(request, response, next)

    expect(memoizedKeycloakMock).toHaveBeenCalledWith('realmName')
  })

  it('should call next with an error if memoizedKeycloak throws an error', async () => {
    const error = new Error('oops')
    memoizedKeycloakMock.mockRejectedValueOnce(error)

    await komgoContextMiddleware(request, response, next)

    expect(next).toHaveBeenCalledWith(error)
  })

  it('should set komgoContext with a correct value', async () => {
    await komgoContextMiddleware(request, response, next)

    expect(request.komgoContext).toMatchObject({
      tenant: {
        decodedToken,
        keycloakInstance,
        staticID: 'companyStaticIdFromEnv'
      }
    })
  })
})
