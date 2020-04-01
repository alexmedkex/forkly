import * as jwt from 'jsonwebtoken'

import IDecodedJWT from '../utils/IDecodedJWT'

/**
 * Decodes authentication token
 * @param {string} token
 * @returns {*}
 */
export default function decode(token: string): IDecodedJWT {
  return jwt.decode(token) as IDecodedJWT
}
