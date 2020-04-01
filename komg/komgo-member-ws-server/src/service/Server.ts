import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { Express } from 'express'
import { Server as HttpServer } from 'http'
import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import SocketIO, { Socket } from 'socket.io'

import health from '../controllers/health'
import { TYPES } from '../inversify/types'
import { IMQMessageHandler } from '../service/MQMessageHandler'
import { IWSConnectionHandler } from '../service/WSConnectionHandler'
import { ErrorName } from '../utils/ErrorName'

const logger = getLogger('Server')

// Preparing server:

const { PORT = 8080 } = process.env

@injectable()
export class Server {
  constructor(
    @inject(TYPES.WSConnectionHandler) private readonly wsConnectionHandler: IWSConnectionHandler,
    @inject(TYPES.MQMessageHandler) private readonly mqMessageHandler: IMQMessageHandler,
    @inject(TYPES.Express) private readonly app: Express,
    @inject(TYPES.HttpServer) private readonly server: HttpServer,
    @inject(TYPES.SocketIO) private readonly io: SocketIO.Server
  ) {
    this.app.use('/', health)
  }

  connect() {
    this.io.on('connection', (socket: Socket) => {
      this.wsConnectionHandler.onWSConnected(socket)
    })
    this.server.listen(PORT, async () => {
      logger.info(`Started WS server on port ${PORT}. Connecting to RMQ...`)
      try {
        await this.mqMessageHandler.createListener()
      } catch (e) {
        logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.createMQListenerFailed, e.message, {
          stacktrace: e.stack
        })
      }
      logger.info('Successfully connected to the RMQ.')
    })
  }
}
