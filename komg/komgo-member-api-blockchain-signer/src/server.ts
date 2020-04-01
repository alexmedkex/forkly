import './service-layer/controllers/HealthController'
import './service-layer/controllers/KeyManageController'
import './service-layer/controllers/OneTimeSignController'
import './service-layer/controllers/SignController'
import './service-layer/controllers/MigrationController'

import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogLevel, LogstashCapableLogger } from '@komgo/logging'
import { requestStorageInstance, Server } from '@komgo/microservice-config'
import axios from 'axios'
import config from 'config'

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { RegisterRoutes } from './middleware/server-config/routes'
import { MICROSERVICE_NAME } from './service-layer/responses'
import IService from './service-layer/services/IService'

// Logging configuration
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
const logstashLabel = MICROSERVICE_NAME
const logger = getLogger('run-server')

const port = parseInt(config.get('express.port'), 10)
const logLevel = config.get('loglevel').toString()
const dbURL = config.get('mongo.url').toString()

setUpLogging()

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
    .setServiceName(logstashLabel)
    .setLogConfig(logLevel)
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .withErrorHandlers()
    .startOn(port)

  // Start services
  logger.info('Starting services')
  iocContainer.get<IService>(TYPES.DecoratorService).start()
}

function setUpLogging() {
  configureLogging(logstashLabel, logLevel as LogLevel, true)
  logger.addLoggingToAxios(axios)
}

const stopServer = async () => {
  if (expressServer !== undefined) {
    logger.info('Stopping Server')
    const serviceDecorator = iocContainer.get<IService>(TYPES.DecoratorService)
    await serviceDecorator.stop()
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
