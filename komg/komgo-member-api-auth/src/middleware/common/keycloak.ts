import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import axios from 'axios'
import { compose } from 'compose-middleware'
import { Response, NextFunction } from 'express'
import * as Keycloak from 'keycloak-connect'
import memoize = require('memoizee')

import { ErrorName } from '../../utils/ErrorName'
import memoryStore from '../../utils/memoryStore'
import { Metric, AccessDeniedReason } from '../../utils/Metric'

import { IKomgoContextAwareRequest } from './IKomgoContext'

const logger = getLogger('keycloak')

export const getKeycloakPublicKey = async (realm: string) => {
  const url = `${process.env.KEYCLOAK_SERVER_AUTH_URL}/realms/${realm}/`
  logger.info(`Keycloak public key request: ${url}`)
  try {
    const res = await axios.get(url)
    return res.data.public_key
  } catch (e) {
    const message = `Error occurred while requesting public keys via URL ${url}. ${e.message}`
    logger.error(ErrorCode.ConnectionKeycloak, ErrorName.GetKeycloakPublicKeyError, message)
    throw ErrorUtils.internalServerException(ErrorCode.ConnectionKeycloak, 'Internal Server Error')
  }
}

/**
 * Create a configured instance of Keycloak
 */
export const getKeycloak = async (realm: string) => {
  const keycloakInstance = new Keycloak(
    { store: memoryStore },
    {
      realm,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      serverUrl: process.env.KEYCLOAK_AUTH_URL,
      public: true,
      // although keycloak-connect documentation says that Keycloak instance will fetch a public key
      // automatically if we don't pass it explicitly, it doesn't fetch it and the request will fail on JWT validation
      realmPublicKey: await getKeycloakPublicKey(realm),
      'ssl-required': 'external'
    }
  )

  keycloakInstance.accessDenied = function(req: IKomgoContextAwareRequest, res: Response, next: NextFunction) {
    logger.metric({
      [Metric.AccessDenied]: AccessDeniedReason.KeycloakValidationError
    })

    return next(ErrorUtils.forbiddenException(ErrorCode.Authorization, 'Access denied. Invalid or expired JWT'))
  }

  keycloakInstance.redirectToLogin = function() {
    return false
  }

  return keycloakInstance
}

const defaultCachePeriod = 10 * 60e3
export const memoizedKeycloak = memoize(getKeycloak, {
  primitive: true, // use a hash map instead of an array for cache storage
  promise: true,
  maxAge: defaultCachePeriod,
  preFetch: true // silently pre-fetch a new value in order to keep a public key up-to-date
})

/**
 * Expressjs middleware that runs keycloak middlewares
 * We need this wrapper to run middlewares for the appropriate realm name
 */
export const keycloakMiddlewareWrapper = (req: IKomgoContextAwareRequest, res: Response, next: NextFunction) =>
  req.komgoContext.tenant ? compose(req.komgoContext.tenant.keycloakInstance.middleware())(req, res, next) : next()

/**
 * Wraps Keycloak.protect() into a new middleware that users a correct keycloak instance
 */
export const keycloakProtectMiddlewareWrapper = (req: IKomgoContextAwareRequest, res: Response, next: NextFunction) =>
  req.komgoContext.tenant.keycloakInstance.protect()(req, res, next)
