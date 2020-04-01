import { IUser } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import { ErrorName } from '../../service-layer/utils/ErrorName'

import { getUserById } from './getUsersByPermission'

export const getUsers = async (userId: string): Promise<IUser[]> => {
  const logger = getLogger('getUsers')
  let users = []

  try {
    users = [await getUserById(userId)]
  } catch (e) {
    logger.warn(ErrorCode.DatabaseMissingData, ErrorName.userMissing, e.message, {
      toUser: userId,
      stacktrace: e.stack
    })
  }

  return users
}
