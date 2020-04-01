import { getLogger } from '@komgo/logging'

import { getUserId } from './getUserId'

export const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('getUserId', () => {
  const logger = getLogger('getUserIdTest')

  it('should return a user ID successfully', () => {
    const result = getUserId(MOCK_ENCODED_JWT, logger)
    expect(result).toEqual('1234567890')
  })

  it('should fail if encoded JWT is malformed', () => {
    try {
      getUserId('malformedJWT', logger)
      fail('Expected failure')
    } catch (error) {
      expect(error.status).toBe(400)
      expect(error.errorObject.fields).toEqual({
        authorizationToken: ['invalid JWT token']
      })
    }
  })
})
