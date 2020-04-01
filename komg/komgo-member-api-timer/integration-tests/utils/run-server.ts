import * as config from 'config'
import DataAccess from '@komgo/data-access'

import { configureLogging, getLogger } from '@komgo/logging'
import { Server } from '@komgo/microservice-config'
import { RegisterRoutes } from '../../src/middleware/server-config/routes'
import { iocContainer } from '../../src/inversify/ioc';
import { Container } from 'inversify';
import { errorMappingMiddleware } from '../../src/service-layer/middleware/errorMappingMiddleware'

configureLogging('api-timer-integration-test')

const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()
const server = new Server(getLogger('Server'))
const serviceName = 'api-timer-integration-test'

RegisterRoutes(server.express)

const logger = getLogger('run-server')

let expressServer

const runServer = async () => {
  DataAccess.setUrl(dbUrl)
  DataAccess.setAutoReconnect(true)
  DataAccess.connect()

  server.setServiceName(serviceName).setLogConfig(logLevel as any)
  server.express.use(errorMappingMiddleware)

  return server
    .withErrorHandlers()
    .startOn(port as any)
    .then(async start => {
      expressServer = start

      logger.info('Service started')
    })
}

const stopServer = async () => {
  if (server !== undefined) {
    logger.info('Stopping services')

    logger.info(`
    ----------------
    Stopping Server
    ----------------
    `)

    expressServer.close()
    DataAccess.disconnect()
  }
}

export { runServer, stopServer }