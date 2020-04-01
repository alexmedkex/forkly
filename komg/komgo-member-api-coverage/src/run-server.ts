import * as config from 'config'
import DataAccess from '@komgo/data-access'

import { configureLogging, getLogger } from '@komgo/logging'
import { Server } from '@komgo/microservice-config'

import { RegisterRoutes } from './middleware/server-config/routes'
import IService from './service-layer/events/IService'

import './service-layer/controllers'
import { iocContainer } from './inversify/ioc'

import { TYPES } from './inversify/types'
import axios from 'axios'
import { errorMappingMiddleware } from './service-layer/middleware/errorMappingMiddleware'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from './utils/Constants'

const serviceName = 'api-coverage'

const logstashLabel = process.env.CONTAINER_HOSTNAME || serviceName
configureLogging(logstashLabel)

const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()
const server = new Server(getLogger('Server'))

RegisterRoutes(server.express)

const logger = getLogger('RunServer')
getLogger('Axios').addLoggingToAxios(axios)
logger.info('logger setup with environment variables', {
  logstashLabel,
  logtstashHost: process.env.LOGSTASH_HOST,
  logtstashPort: process.env.LOGSTASH_PORT,
  deploymentEnvironment: process.env.DEPLOYMENT_ENVIRONMENT
})

const runServer = (withAutoReconnect: boolean = true) => {
  DataAccess.setUrl(dbUrl)
  DataAccess.setAutoReconnect(withAutoReconnect)
  DataAccess.connect()

  server.setServiceName(serviceName).setLogConfig(logLevel as any)
  server.express.use(errorMappingMiddleware)
  server
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .withErrorHandlers()
    .startOn(port as any)
    .then(async () => {
      try {
        await iocContainer.get<IService>(TYPES.CoverageEventProcessor).start()
      } catch (error) {
        logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.ConnectToInternalMQFailed, error.message)
      }
      logger.info('Service started')
    })
}

runServer()
