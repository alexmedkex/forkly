import { createAuthToken, verifyToken, decode } from './token-helpers'

const user = '123'

const error = new Error('Unable to access data as user cannot be verified')

describe('Token helper', () => {
  it('returns a valid token from createAuthToken()', async () => {
    const token = createAuthToken(user)
    expect(verifyToken(token)).not.toEqual(error)
  })

  it('returns an error for invalid token', async () => {
    expect(verifyToken('token')).toEqual(error)
  })

  it('returns a valid jwt from decoder', async () => {
    const token = createAuthToken(user)
    const jwt = decode(token)
    expect(jwt.userId).toEqual(user)
  })
})
