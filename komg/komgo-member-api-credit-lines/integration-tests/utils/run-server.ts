import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger } from '@komgo/logging'
import { Server } from '@komgo/microservice-config'
import * as config from 'config'
import { Container } from 'inversify'

import { TYPES } from '../../src/inversify/types'
import { RegisterRoutes } from '../../src/middleware/server-config/routes'
import { errorMappingMiddleware } from '../../src/service-layer/middleware/errorMappingMiddleware'
import MessageProcessorService from '../../src/service-layer/services/MessageProcessorService'

configureLogging('api-credit-lines-integration-test')

const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()
const server = new Server()
const serviceName = 'api-credit-lines-integration-test'

RegisterRoutes(server.express)

const logger = getLogger('run-server')

let expressServer

const runServer = async (iocContainer?: Container) => {
  DataAccess.setUrl(dbUrl)
  DataAccess.setAutoReconnect(true)
  DataAccess.connect()

  server.setServiceName(serviceName) // .setLogConfig(logLevel as any)
  server.express.use(errorMappingMiddleware)

  if (iocContainer) {
    await iocContainer.get<MessageProcessorService>(TYPES.MessageProcessorService).start()
  }

  return server
    .withErrorHandlers()
    .startOn(port as any)
    .then(async start => {
      expressServer = start

      logger.info('Service started')
    })
}

const stopServer = async (iocContainer?: Container) => {
  if (expressServer) {
    logger.info('Stopping services')

    logger.info(`
    ----------------
    Stopping Server
    ----------------
    `)

    if (iocContainer) {
      await iocContainer.get<MessageProcessorService>(TYPES.MessageProcessorService).stop()
    }

    expressServer.close()
    DataAccess.disconnect()
  }
}

export { runServer, stopServer }
