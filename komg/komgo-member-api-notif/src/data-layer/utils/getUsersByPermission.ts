import axios from 'axios'
import { IUser } from '@komgo/types'

import { IRequiredPermission } from '../../service-layer/request/task'

export const getUsersByPermission = async (perm: IRequiredPermission): Promise<IUser[]> => {
  const res: any = await axios.get(
    `${process.env.API_USERS_BASE_URL}/v0/users?productId=${perm.productId}&actionId=${perm.actionId}`
  )

  return res.data
}

export const getUserIDsByPermission = async (perm: IRequiredPermission): Promise<string[]> => {
  const users = await getUsersByPermission(perm)
  return users.map(user => user.id)
}

export const getUserById = async (userId: string): Promise<IUser> => {
  const res: any = await axios.get(`${process.env.API_USERS_BASE_URL}/v0/users/${userId}`)
  return res.data
}
