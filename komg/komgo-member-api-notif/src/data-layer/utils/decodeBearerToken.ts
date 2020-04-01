import * as jwt from 'jsonwebtoken'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

interface IRealmAccess {
  roles: string[]
}

export interface IDecodedJWT {
  realm_access: IRealmAccess
  name: string
  sub: string // Keycloak User ID
}

/**
 * Decodes authentication token
 * @param {string} token
 * @returns {*}
 */
export function decodeBearerToken(token: string): IDecodedJWT {
  const decodedJWT = jwt.decode(token.replace('Bearer ', '')) as IDecodedJWT
  if (!decodedJWT) {
    throw ErrorUtils.badRequestException(ErrorCode.Authorization, 'invalid JWT token', {})
  }
  return decodedJWT
}
