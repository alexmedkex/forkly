import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

const isPermitted = jest.fn()
jest.mock('../../utils/isPermitted', () => ({ default: isPermitted }))
jest.mock('jsonwebtoken', () => ({
  decode: mockDecode
}))

const mockEnd = jest.fn()
const mockJson = jest.fn(() => ({ end: mockEnd }))
const res = { status: () => ({ end: mockEnd, json: mockJson }) }
const mockNext = jest.fn()
const next = mockNext
const signedInRequest = {
  komgoContext: {
    tenant: {
      staticId: 'staticId',
      tenantAwareAxios: jest.fn(),
      decodedToken: {
        realm_access: {
          roles: ['testRoleId']
        }
      }
    },
    route: {
      isSignedIn: true
    }
  },
  query: {
    baseUrl: 'baseUrl',
    method: 'method',
    path: 'path'
  }
}
const withPermissionRequest = {
  ...signedInRequest,
  komgoContext: {
    ...signedInRequest.komgoContext,
    route: { isSignedIn: false, permissions: [['product', 'action', 'minPermission']] }
  }
}

import checkPermission from './checkPermission'

describe('checkPermissionMiddleware', () => {
  it('should return if signedIn permission', () => {
    checkPermission(signedInRequest, res, next)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should throw an Error because of api-roles server error', async () => {
    isPermitted.mockRejectedValueOnce(new Error('error'))

    await checkPermission(withPermissionRequest, res, next)

    expect(mockNext).toHaveBeenCalledWith(new Error('error'))
  })

  it('should throw an Error because of insufficient permissions', async () => {
    isPermitted.mockResolvedValueOnce(false)

    await checkPermission(withPermissionRequest, res, next)

    expect(mockNext).toHaveBeenCalledWith(ErrorUtils.forbiddenException(ErrorCode.Authorization, 'Access denied'))
  })

  it('should call next if isPermitted returns true', async () => {
    isPermitted.mockResolvedValueOnce(true)

    await checkPermission(withPermissionRequest, res, next)

    expect(mockNext).toHaveBeenCalledWith()
  })

  it('should call isPermitted with correct arguments', async () => {
    isPermitted.mockResolvedValueOnce(true)

    await checkPermission(withPermissionRequest, res, next)

    expect(isPermitted).toHaveBeenCalledWith(withPermissionRequest.komgoContext.tenant.tenantAwareAxios, {
      permissions: ['product:action:minPermission'],
      roles: ['testRoleId']
    })
  })
})
