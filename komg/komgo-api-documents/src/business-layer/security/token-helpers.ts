import * as config from 'config'
import * as jwt from 'jsonwebtoken'

const opts = {
  secretOrKey: config.get('auth.jwt_secret').toString()
}

/**
 * Generates the authentication token
 * @param {string} userId
 * @returns {string}
 */
function createAuthToken(userId: string): string {
  const user = { userId }
  const token = jwt.sign(user, config.get('auth.jwt_secret').toString(), { expiresIn: 60 * 60 })
  return token
}

/**
 * Verifies the authentication token
 * @param {string} token
 * @returns {*}
 */
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, opts.secretOrKey) as any
  } catch (err) {
    return new Error('Unable to access data as user cannot be verified')
  }
}

function decode(token: string): any {
  try {
    return jwt.decode(token) as any
  } catch (err) {
    return new Error('Unable to access data cannot be decode')
  }
}

export { createAuthToken, verifyToken, decode }
