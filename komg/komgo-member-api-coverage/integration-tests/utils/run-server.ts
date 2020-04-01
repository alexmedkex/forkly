import * as config from 'config'
import DataAccess from '@komgo/data-access'

import { configureLogging, getLogger } from '@komgo/logging'
import { Server } from '@komgo/microservice-config'

import IService from '../../src/service-layer/events/IService'

import '../../src/service-layer/controllers'

import { TYPES } from '../../src/inversify/types'
import { errorMappingMiddleware } from '../../src/service-layer/middleware/errorMappingMiddleware'
import { RegisterRoutes } from '../../src/middleware/server-config/routes'
import { Container } from 'inversify'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../src/utils/Constants'

configureLogging('api-coverage-integration-test')

const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()
const server = new Server(getLogger('Server'))
const serviceName = 'api-coverage-integration'
RegisterRoutes(server.express)
const logger = getLogger('startup-logger')

let expressServer

const runServer = async (iocContainer: Container) => {
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
      try {
        await iocContainer.get<IService>(TYPES.CoverageEventProcessor).start()
      } catch (error) {
        logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.ConnectToInternalMQFailed, error.message)
      }
      logger.info('Service started')
    })
}

const stopServer = async (iocContainer: Container) => {
  if (server !== undefined) {
    logger.info('stopping services')
    // iocContainer.get<IService>(TYPES.CoverageEventProcessor).stop()

    logger.info(
      `
      ------------
      Stopping Server
      ------------
    `
    )
    expressServer.close()
    DataAccess.disconnect()
  }
}

export { runServer, stopServer }
