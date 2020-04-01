import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { requestStorageInstance, Server } from '@komgo/microservice-config'
import * as config from 'config'

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'
import InboundProcessorService from './service-layer/services/InboundProcessorService'
// Logging configuration
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
const microserviceName = 'api-rfp'
configureLogging(microserviceName)
const logger = getLogger('run-server')

const port = parseInt(config.get('express.port'), 10)
const logLevel = config.get('loglevel').toString()
const dbURL = config.get('mongo.url').toString()

let expressServer: any

const server = new Server(getLogger('Server'))

RegisterRoutes(server.express)

const startServer = async (withAutoReconnect: boolean = true) => {
  // connect to MongoDB
  DataAccess.setUrl(dbURL)
  DataAccess.setAutoReconnect(withAutoReconnect)
  DataAccess.connect()

  await iocContainer.get<InboundProcessorService>(TYPES.InboundProcessorService).start()

  // Start server
  expressServer = await server
    .setServiceName(microserviceName)
    .setLogConfig(logLevel)
    .withErrorHandlers()
    .startOn(port)
}

const stopServer = async () => {
  if (expressServer !== undefined) {
    logger.info('Stopping Server')

    await iocContainer.get<InboundProcessorService>(TYPES.InboundProcessorService).stop()

    return new Promise(resolve => {
      expressServer.close(() => {
        logger.info('Express server stopped')
        logger.info('Disconnecting from Mongo')
        DataAccess.disconnect()
        resolve()
      })
    })
  } else {
    throw new Error('Server has not been started yet')
  }
}

export { startServer, stopServer }