import * as config from 'config'
import DataAccess from '@komgo/data-access'

import { configureLogging, getLogger } from '@komgo/logging'

import { Server } from '@komgo/microservice-config'
import { RegisterRoutes } from '../../src/routes'
import IService from '../../src/service-layer/events/IService'

import '../../src/service-layer/controllers/TradeController'
import '../../src/service-layer/controllers/CargoController'
import '../../src/service-layer/controllers/HealthController'

import { Container } from 'inversify'
import { TYPES } from '../../src/inversify/types'
import axios from 'axios'
import { errorMappingMiddleware } from '../../src/service-layer/errors/errorMappingMiddleware'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../src/utils/Constants'

const port = parseInt(config.get('express.port'), 10)
const dbUrl = config.get('mongo.url').toString()
const server = new Server(getLogger('Server'))
const serviceName = process.env.CONTAINER_HOSTNAME || 'api-trade-cargo'

let expressServer

RegisterRoutes(server.express)

configureLogging('api-trade-cargo-integration-test')

const logger = getLogger('RunServer')
logger.info('logger setup with environment variables', {
  serviceName,
  logtstashHost: process.env.LOGSTASH_HOST,
  logtstashPort: process.env.LOGSTASH_PORT,
  deploymentEnvironment: process.env.DEPLOYMENT_ENVIRONMENT
})

const startServer = (iocContainer: Container) => {
  DataAccess.setUrl(dbUrl)
  DataAccess.connect()

  server.setServiceName(serviceName)
  server.express.use(errorMappingMiddleware)
  return server
    .addRequestIdHeaderToAxios(axios)
    .withErrorHandlers()
    .startOn(port as any)
    .then(start => {
      expressServer = start
      return startEventService(iocContainer)
    })
}

async function startEventService(iocContainer: Container) {
  const tradeEventService: IService = iocContainer.get<IService>(TYPES.TradeEventService)
  try {
    await tradeEventService.start()
  } catch (error) {
    logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.ConnectInternalMQFailed, error)
    logger.info('Exiting...')
    process.exit(1)
  }

  logger.info('Service started')
}

const stopServer = async () => {
  return new Promise<void>(resolve => {
    if (server !== undefined) {
      logger.info('stopping services')
      logger.info(
        `
        ------------
        Stopping Server
        ------------
      `
      )
      expressServer.close(() => {
        logger.info('Server closed')
        DataAccess.disconnect()
        resolve()
      })
    } else {
      resolve()
    }
  })
}

export { startServer, stopServer }
