import { ErrorCode } from '@komgo/error-utilities'

import { ErrorName } from './ErrorName'
import getUserId, { UserAuthError } from './getUserId'

describe('getUserId', () => {
  it('should throw InvalidJWTToken', async () => {
    try {
      getUserId('1')
    } catch (e) {
      expect(e).toEqual(new UserAuthError(ErrorCode.Authorization, ErrorName.InvalidJWTToken, '1'))
    }
  })
  it('should throw InvalidSub with empty sub', async () => {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.alf4vgiVBgi5B4CB-_NvsoxHcCcZtAuWTktw8Su1Q8s'
    try {
      getUserId(`Bearer ${token}`)
    } catch (e) {
      expect(e).toEqual(new UserAuthError(ErrorCode.Authorization, ErrorName.InvalidSub, token))
    }
  })
  it('should throw InvalidSub with not a string sub', async () => {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9.nV8y0s2gXicEbBnpsdghmMDNLSKn_4umnoTpWE8eJG4'
    try {
      getUserId(`Bearer ${token}`)
    } catch (e) {
      expect(e).toEqual(new UserAuthError(ErrorCode.Authorization, ErrorName.InvalidSub, token))
    }
  })
  it('should return userId', async () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
    expect(getUserId(`Bearer ${token}`)).toEqual('1234567890')
  })
})
