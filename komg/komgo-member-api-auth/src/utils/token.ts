import * as jwt from 'jsonwebtoken'

import IDecodedJWT from './IDecodedJWT'

/**
 * Decodes authentication token
 * @param {string} token
 * @returns {*}
 */
export const decode = (token: string): IDecodedJWT => jwt.decode(token) as IDecodedJWT

export const getTokenFromAuthHeader = (header: string): IDecodedJWT => decode(header.substr('Bearer '.length))

/**
 * Realm name is a token
 * It's in the issuer URL after the last slash
 * Example: http://localhost:10070/auth/realms/37704b26-2566-48b9-bb99-000000000001
 */
export const getTenantIdFromToken = (decodedToken: IDecodedJWT): string => decodedToken.iss.split('/').pop()
