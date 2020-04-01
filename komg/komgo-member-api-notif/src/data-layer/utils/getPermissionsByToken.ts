import axios from 'axios'
import { decodeBearerToken, IDecodedJWT } from './decodeBearerToken'

export const getPermissionsByToken = async (token: string) => {
  const decoded: IDecodedJWT = decodeBearerToken(token)
  const roles: string = decoded.realm_access.roles.join(',')
  const response: any = await axios.get(`${process.env.API_ROLES_BASE_URL}/v0/permissions-by-roles?roles=${roles}`)

  return response.data.map(perm => ({ productId: perm.product.id, actionId: perm.action.id }))
}
