import { getLogger } from '@komgo/logging'
import { Express } from 'express'
import { Server as HttpServer } from 'http'
import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { TYPES } from './inversify/types'
import health from './service-layer/controllers/health'

const logger = getLogger('Server')

const { PORT = 8080 } = process.env

@injectable()
export class Server {
  constructor(
    @inject(TYPES.Express) private readonly app: Express,
    @inject(TYPES.HttpServer) private readonly server: HttpServer
  ) {
    this.app.use('/v0', health)
  }

  connect() {
    this.server.listen(PORT, () => {
      logger.info(`Started HTTP server on port ${PORT}.`)
    })
  }
}
