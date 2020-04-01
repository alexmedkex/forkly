import DataAccess from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { requestStorageInstance, Server } from '@komgo/microservice-config'
import * as config from 'config'

import { startHealthReporter } from './business-layer/healthcheck/healthcheck'
import { ITimerScheduleService } from './business-layer/schedule/TimerScheduleService'
import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'
import { errorMappingMiddleware } from './service-layer/middleware/errorMappingMiddleware'
import { ErrorName } from './utils/Constants'

// Logging configuration
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
const microserviceName = 'api-timer'
configureLogging(microserviceName)
const logger = getLogger('run-server')

const port = parseInt(config.get('express.port'), 10)
const logLevel = config.get('loglevel').toString()
const dbURL = config.get('mongo.url').toString()

let expressServer: any
let healthReportScheduler: any

const server = new Server(getLogger('Server'))

RegisterRoutes(server.express)

const startServer = async (withAutoReconnect: boolean = true) => {
  // connect to MongoDB
  DataAccess.setUrl(dbURL)
  DataAccess.setAutoReconnect(withAutoReconnect)
  DataAccess.connect()
  server.express.use(errorMappingMiddleware)

  // Start server
  expressServer = await server
    .setServiceName(microserviceName)
    .setLogConfig(logLevel)
    .withErrorHandlers()
    .startOn(port)
    .then(async x => {
      try {
        await iocContainer.get<ITimerScheduleService>(TYPES.TimerScheduleService).start()
      } catch (err) {
        logger.error(ErrorCode.UnexpectedError, ErrorName.TimerScheduleServerError, {
          err: err.message,
          errorName: err && err.name ? err.name : null
        })
        throw err
      }
      logger.info('Timer schedule processor started')
      return x
    })
  healthReportScheduler = startHealthReporter()
}

const stopServer = async () => {
  if (healthReportScheduler) {
    healthReportScheduler.cancel()
  }
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
