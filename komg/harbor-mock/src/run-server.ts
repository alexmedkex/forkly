import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance } from '@komgo/microservice-config'
import * as config from 'config'

import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'
import './types'

const port = config.get('express.port')
const logLevel = config.get('loglevel')

LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('harbor-mock')
const logger = getLogger('Server')
const server = new Server(logger)

RegisterRoutes(server.express)
server
  .setServiceName('harbor-mock')
  .setLogConfig(logLevel as any)
  .withErrorHandlers()
server.startOn(port as any)
