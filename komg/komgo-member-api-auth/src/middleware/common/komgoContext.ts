import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { NextFunction, Response } from 'express'

import { ErrorName } from '../../utils/ErrorName'
import { isLmsNode } from '../../utils/isLmsNode'
import { tenantAwareAxios, tenantIdHeaderName } from '../../utils/tenantAwareAxios'
import { getTenantIdFromToken, getTokenFromAuthHeader } from '../../utils/token'

import { IKomgoContextAwareRequest } from './IKomgoContext'
import { memoizedKeycloak } from './keycloak'

const logger = getLogger('komgoContextMiddleware')

/**
 * This middleware adds komgoContext object to the request
 */
export const komgoContextMiddleware = async (req: IKomgoContextAwareRequest, res: Response, next: NextFunction) => {
  req.komgoContext = {}
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    return next()
  }

  let decodedToken
  let staticID
  try {
    decodedToken = getTokenFromAuthHeader(authHeader)
    staticID = isLmsNode() ? getTenantIdFromToken(decodedToken) : process.env.COMPANY_STATIC_ID
  } catch (e) {
    logger.warn(ErrorCode.Authorization, ErrorName.InvalidJWT, e.message, {
      stacktrace: e.stack,
      staticID
    })

    return next(ErrorUtils.forbiddenException(ErrorCode.Authorization, 'Invalid JWT'))
  }

  let keycloakInstance
  try {
    keycloakInstance = await memoizedKeycloak(isLmsNode() ? staticID : process.env.KEYCLOAK_REALM_NAME)
  } catch (e) {
    return next(e)
  }

  req.komgoContext.tenant = {
    staticID,
    decodedToken,
    keycloakInstance,
    tenantAwareAxios: tenantAwareAxios(staticID)
  }

  // make sure we always return X-Tenant-StaticID header,
  // which is needed in API Gateway to properly route requests
  res.set(tenantIdHeaderName, staticID)

  next()
}
