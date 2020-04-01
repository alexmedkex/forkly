import { ErrorCode } from '@komgo/error-utilities'
import logger from '@komgo/logging'
import { permissionsByProductAndAction } from '@komgo/permissions'

import { ErrorName } from './ErrorName'

export const getRolePermissions = roles =>
  roles.reduce((res, role) => {
    if (!role) {
      return res
    }

    const actions = role.permittedActions.reduce((actionRes, tuple) => {
      const productAndAction = `${tuple.product.id}:${tuple.action.id}`
      const permissions = permissionsByProductAndAction[productAndAction]
      if (!permissions) {
        logger.error(
          ErrorCode.DatabaseInvalidData,
          ErrorName.roleHasInvalidAction,
          `Role has an invalid action ${productAndAction}`
        )
        return actionRes
      }

      if (permissions && permissions.length === 0) {
        return [...actionRes, productAndAction]
      }

      const permArray = []
      let isValidPermission = false
      for (const permission of permissions) {
        permArray.push(`${tuple.product.id}:${tuple.action.id}:${permission}`)
        if (permission === tuple.permission.id) {
          isValidPermission = true
          break
        }
      }

      if (!isValidPermission) {
        logger.error(
          ErrorCode.DatabaseInvalidData,
          ErrorName.roleHasInvalidPermission,
          `Role has an invalid permission ${productAndAction}:${tuple.permission.id}`
        )
        return actionRes
      }

      return [...actionRes, ...permArray]
    }, [])

    return [...res, ...actions]
  }, [])
