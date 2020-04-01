import { some } from 'lodash'
import { products } from '@komgo/permissions'

import { PermittedActions, PermissionFullId } from '..//features/role-management/store/types'

interface PermissionsMapInterface {
  [name: string]: string
}
// a map where key is "<productId>:<actionId>" and value is an array of permission IDs (e.g. 'read', 'crud', etc.)
const permissionsByProductAndAction: PermissionsMapInterface = products.reduce((map: any, prod) => {
  prod.actions.forEach(action => {
    if (action.permissions && action.permissions.length) {
      map[`${prod.id}:${action.id}`] = action.permissions.map(perm => perm.id)
    } else {
      map[`${prod.id}:${action.id}`] = []
    }
  })
  return map
}, {})

export const isAuthorized = (permissions: PermittedActions[], requiredPerm: PermissionFullId): boolean =>
  some(permissions, perm => {
    if (perm.product.id !== requiredPerm.product || perm.action.id !== requiredPerm.action) {
      // neither product nor action matches
      return false
    }
    if (requiredPerm.permission === null) {
      return true
    }
    if (perm.permission.id === requiredPerm.permission) {
      // exact match by permission id
      return true
    }
    const productPermissions = permissionsByProductAndAction[`${requiredPerm.product}:${requiredPerm.action}`]
    if (!productPermissions) {
      // Code should not go into this state
      // console.error(
      //   'Looks like role permissions are not in sync with @komgo/permissions package.',
      //   'productPermissions:',
      //   productPermissions,
      //   'requiredPerm:',
      //   requiredPerm
      // )
      return false
    }

    // required permission should go before permitted permission in the array
    return productPermissions.indexOf(requiredPerm.permission) < productPermissions.indexOf(perm.permission.id)
  })
