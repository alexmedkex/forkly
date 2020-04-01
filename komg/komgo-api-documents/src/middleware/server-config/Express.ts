import logger from '@komgo/logging'
import * as express from 'express'
import 'reflect-metadata'

/**
 * Express Configuration Class
 * @export
 * @class ExpressConfig
 */
export class ExpressConfig {
  app: express.Express

  static: any

  constructor() {
    this.app = express()
    this.static = express.static

    const loggingMiddleware = logger.createLoggingMiddleware()
    this.app.use(loggingMiddleware)
  }
}
