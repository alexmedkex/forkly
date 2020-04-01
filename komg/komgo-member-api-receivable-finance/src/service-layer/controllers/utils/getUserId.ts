import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { IValidationErrors } from '@komgo/types'
import { decode } from 'jsonwebtoken'

import { ErrorName } from '../../../ErrorName'

/**
 * Decodes authentication token and returns the userId
 *
 * @param {string} token the authorization token
 * @returns {string} the user id
 */
export function getUserId(token: string, logger: LogstashCapableLogger): string {
  const decodedJWT = decode(token.replace('Bearer ', ''))
  if (!decodedJWT) {
    const errorMessage = 'invalid JWT token'
    const validationErrors: IValidationErrors = {
      authorizationToken: [errorMessage]
    }
    logger.error(ErrorCode.Authorization, ErrorName.InvalidJWTToken, errorMessage, {
      token
    })
    throw ErrorUtils.badRequestException(ErrorCode.Authorization, errorMessage, validationErrors)
  }

  return decodedJWT.sub
}
