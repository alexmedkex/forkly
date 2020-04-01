import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'
import { Socket } from 'socket.io'

import { ErrorName } from '../utils/ErrorName'
import { getUserId, UserAuthError } from '../utils/getUserId'
import { verifyAuthorization } from '../utils/verifyAuthorization'

export interface IWSConnectionHandler {
  onWSConnected: (socket: any) => void
}

const logger = getLogger('MQMessageHandler')

@injectable()
export class WSConnectionHandler implements IWSConnectionHandler {
  onWSConnected(socket: Socket) {
    const authTimeout = setTimeout(() => {
      socket.disconnect(true)
    }, 5000)

    socket.on('authenticate', async ({ token }) => {
      try {
        const userId = getUserId(token)
        await verifyAuthorization(token)
        socket.join(userId)
        clearTimeout(authTimeout)
        socket.emit('authenticated')
        logger.info(`Successfully connected socket for user ${userId}`)
      } catch (error) {
        if (error instanceof UserAuthError) {
          logger.warn(error.errorCode, error.errorName, error.token)
        } else {
          logger.warn(ErrorCode.Authorization, ErrorName.userIsNotLoggedIn, {
            status: error.response.status,
            requestId: error.config.headers['X-Request-ID']
          })
        }
        socket.disconnect(true)
      }
    })
  }
}
