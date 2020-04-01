import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { Response, NextFunction } from 'express'

import checkLicenses from '../../utils/checkLicenses'
import isPermitted from '../../utils/isPermitted'
import { Metric, AccessDeniedReason } from '../../utils/Metric'

import { IKomgoContextAwareRequest } from './IKomgoContext'

const logger = getLogger('checkPermissionMiddleware')
const accessGranted = 'Access granted'

/**
 * Calls API Roles to check if a user is permitted to use a requested route and method
 */
const checkPermissionMiddleware = async (req: IKomgoContextAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { baseUrl, method, path } = req.query
    const {
      tenant: { decodedToken, staticID, tenantAwareAxios },
      route: { isSignedIn, permissions }
    } = req.komgoContext
    const userId = decodedToken.sub

    const permissionsString: string[] = permissions.map((permission: string[]) => permission.join(':'))

    await checkLicenses(staticID, permissionsString, path)

    if (isSignedIn) {
      // route has 'signedIn' annotation and the JWT was validated in the prev. middleware
      // so we grant access for this request
      logger.info(accessGranted, { userId, baseUrl, method, path })
      return next()
    }

    const permitted: boolean = await isPermitted(tenantAwareAxios, {
      roles: decodedToken.realm_access.roles,
      permissions: permissionsString
    })

    if (permitted) {
      logger.info(accessGranted, { userId, baseUrl, method, path })
      return next()
    }

    logger.metric({
      [Metric.AccessDenied]: AccessDeniedReason.InsufficientPermission
    })

    next(ErrorUtils.forbiddenException(ErrorCode.Authorization, 'Access denied'))
  } catch (err) {
    logger.metric({
      [Metric.AccessDenied]: AccessDeniedReason.UnexpectedError
    })
    next(err)
  }
}

export default checkPermissionMiddleware
