import DataAccess from '@komgo/data-access'
import logger, { configureLogging, LogstashCapableLogger } from '@komgo/logging'
import axios from 'axios'
import * as config from 'config'

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { Server } from './Server'
import IService from './service-layer/IService'
import requestIdHandlerInstance from './util/RequestIdHandler'

LogstashCapableLogger.addRequestStorage(requestIdHandlerInstance)

const microserviceName = 'event-management'
configureLogging(microserviceName)

logger.info('logger setup with environment variables', {
  microserviceName,
  logtstashHost: process.env.LOGSTASH_HOST,
  logtstashPort: process.env.LOGSTASH_PORT,
  deploymentEnvironment: process.env.DEPLOYMENT_ENVIRONMENT
})
logger.addLoggingToAxios(axios)

// connect to MongoDB
DataAccess.setUrl(config.get('mongo.url').toString())
DataAccess.connect()

logger.info('Starting services')
iocContainer.get<IService>(TYPES.DecoratorService).start()

const server = iocContainer.get<Server>(TYPES.Server)
server.connect()

logger.info('Application started')
