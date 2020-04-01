import './service-layer/controllers/HealthController'
import './service-layer/controllers/KeyManageController'
import './service-layer/controllers/RsaSignerController'
import './service-layer/controllers/MigrationController'

import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger, LogLevel } from '@komgo/logging'
import { requestStorageInstance, Server } from '@komgo/microservice-config'
import config from 'config'

import { RegisterRoutes } from './middleware/server-config/routes'
import { MICROSERVICE_NAME } from './service-layer/responses'

// Logging configuration
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
const logstashLabel = MICROSERVICE_NAME
configureLogging(logstashLabel, LogLevel.Info, true)
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
    .setServiceName('api-signer')
    .setLogConfig(logLevel)
    .withErrorHandlers()
    .startOn(port)
}

const stopServer = async () => {
  return new Promise((resolve, reject) => {
    if (expressServer !== undefined) {
      logger.info('Stopping Server')
      expressServer.close(() => {
        DataAccess.disconnect()
        resolve()
      })
    } else {
      reject('Server has not been started yet')
    }
  })
}

export { startServer, stopServer }
