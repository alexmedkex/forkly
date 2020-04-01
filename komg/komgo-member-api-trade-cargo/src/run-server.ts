import * as config from 'config'
import DataAccess from '@komgo/data-access'

import { configureLogging, getLogger, LogLevel } from '@komgo/logging'
import { Server } from '@komgo/microservice-config'
import { RegisterRoutes } from './routes'
import IService from './service-layer/events/IService'

import './service-layer/controllers/TradeController'
import './service-layer/controllers/CargoController'
import './service-layer/controllers/HealthController'
import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import axios from 'axios'
import { errorMappingMiddleware } from './service-layer/errors/errorMappingMiddleware'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from './utils/Constants'

const port = parseInt(config.get('express.port'), 10)
const dbUrl = config.get('mongo.url').toString()
const server = new Server(getLogger('Server'))
const serviceName = process.env.CONTAINER_HOSTNAME || 'api-trade-cargo'

RegisterRoutes(server.express)
process.env.LOG_LEVEL = LogLevel.Info

configureLogging(serviceName)
getLogger('Axios').addLoggingToAxios(axios)

const logger = getLogger('RunServer')
logger.info('logger setup with environment variables', {
  serviceName,
  logtstashHost: process.env.LOGSTASH_HOST,
  logtstashPort: process.env.LOGSTASH_PORT,
  deploymentEnvironment: process.env.DEPLOYMENT_ENVIRONMENT
})

const runServer = () => {
  DataAccess.setUrl(dbUrl)
  DataAccess.connect()

  server.setServiceName(serviceName)
  server.express.use(errorMappingMiddleware)
  return server
    .addRequestIdHeaderToAxios(axios)
    .withErrorHandlers()
    .startOn(port as any)
}

runServer().then(startEventService)

async function startEventService() {
  const tradeEventService: IService = iocContainer.get<IService>(TYPES.TradeEventService)
  try {
    await tradeEventService.start()
  } catch (error) {
    logger.error(
      ErrorCode.ConnectionInternalMQ,
      ErrorName.ConnectInternalMQFailed,
      'Error when starting service to listen from Internal-MQ',
      error,
      'Exiting...'
    )
    process.exit(1)
  }

  logger.info('Service started')
}
