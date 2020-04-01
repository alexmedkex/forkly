import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { Response, NextFunction } from 'express'
import { isEmpty } from 'lodash'

import { fetchCachedSwaggerJSON, ISwaggerJSON } from '../../utils/fetchSwaggerJSON'
import { findSwaggerRouteByPath } from '../../utils/findSwaggerRouteByPath'
import { Metric, AccessDeniedReason } from '../../utils/Metric'

import { IKomgoContextAwareRequest } from './IKomgoContext'
import { IPermission } from './IPermission'

const logger = getLogger('swaggerDataMiddleware')

/**
 * - fetch swagger.json from the target MS
 * - check if the requested endpoint and the method exists in the file
 * - return "unauthorized" for internal endpoints
 * - return "authorized" (HTTP 204) for public endpoints
 * - add permission object from the route's "security" object to the request context and call the next middleware
 */
const swaggerDataMiddleware = async (req: IKomgoContextAwareRequest, res: Response, next: NextFunction) => {
  const { baseUrl, method, path } = req.query

  // allow access to swagger.json to make Swagger UI on API Gateway work
  if (path === '/swagger.json') {
    return process.env.ALLOW_SWAGGER_ACCESS === 'true'
      ? res.status(204).end()
      : // return 404 instead of 403 so we not reveal that there's a swagger.json file
        next(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
  }

  try {
    const swaggerJSON: ISwaggerJSON = await fetchCachedSwaggerJSON(baseUrl)

    const endpointPath: string = path.substr(swaggerJSON.basePath.length)
    const matchedRoute: string = findSwaggerRouteByPath(Object.keys(swaggerJSON.paths), endpointPath)

    if (!matchedRoute) {
      return next(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
    }

    let security
    try {
      security = swaggerJSON.paths[matchedRoute][method.toLowerCase()].security
    } catch (e) {
      return next(ErrorUtils.methodNotAllowedException(ErrorCode.Authorization, 'Method Not Allowed'))
    }

    if (isEmpty(security) || security.some(obj => obj.hasOwnProperty('internal'))) {
      if (security.length > 1) {
        return next(new Error('"internal" should not be combined with other Security annotations'))
      }
      logger.metric({ [Metric.AccessDenied]: AccessDeniedReason.ProtectedRoute })
      // return 404 instead of 403 so we not reveal that there's a protected route there
      return next(ErrorUtils.notFoundException(ErrorCode.Authorization, 'Not Found'))
    }

    if (security.some(obj => obj.hasOwnProperty('public'))) {
      return security.length > 1
        ? next(new Error('"public" should not be combined with other Security annotations'))
        : res.status(204).end()
    }

    const permissions: IPermission[] = security.reduce(
      (result, obj) => (obj.hasOwnProperty('withPermission') ? [...result, obj.withPermission] : result),
      []
    )

    const isSignedIn = security.some(obj => obj.hasOwnProperty('signedIn'))

    req.komgoContext.route = { permissions, isSignedIn }

    // at this point we know that the request shold have a JWT in Authorization header
    // if the header exists the previous middleware should have added `tenant` object to komgoContext
    if (!req.komgoContext.tenant) {
      return next(
        ErrorUtils.forbiddenException(ErrorCode.Authorization, 'Authorization header is required for this request')
      )
    }

    next()
  } catch (err) {
    logger.metric({
      [Metric.AccessDenied]: AccessDeniedReason.UnexpectedError
    })
    next(err)
  }
}

export default swaggerDataMiddleware
