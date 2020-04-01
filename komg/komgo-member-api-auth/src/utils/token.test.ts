const jwtDecodeMock = jest.fn()
jest.mock('jsonwebtoken', () => ({
  decode: jwtDecodeMock
}))
import { decode, getTokenFromAuthHeader, getTenantIdFromToken } from './token'

describe('decode', () => {
  it('should return decoded jwt token', () => {
    const decodedToken = { sub: 'user id' }
    jwtDecodeMock.mockReturnValueOnce(decodedToken)
    expect(decode('jwt')).toEqual(decodedToken)
  })
})

describe('getTokenFromAuthHeader', () => {
  it('should call jwt.decode with JWT', () => {
    getTokenFromAuthHeader('Bearer jwt-string')
    expect(jwtDecodeMock).toHaveBeenCalledWith('jwt-string')
  })
})

describe('getTenantIdFromToken', () => {
  const tenantId = getTenantIdFromToken({
    sub: 'user id',
    realm_access: { roles: [] },
    iss: 'http://localhost:10070/auth/realms/tenant-id'
  })
  expect(tenantId).toBe('tenant-id')
})
