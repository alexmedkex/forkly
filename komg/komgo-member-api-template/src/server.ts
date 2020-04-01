import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { requestStorageInstance, Server } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'

// Logging configuration
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
const microserviceName = 'api-template'
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

  // Start server
  expressServer = await server
    .setServiceName(microserviceName)
    .setLogConfig(logLevel)
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .withErrorHandlers()
    .startOn(port as any)
}

const stopServer = async () => {
  if (expressServer !== undefined) {
    logger.info('Stopping Server')
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
