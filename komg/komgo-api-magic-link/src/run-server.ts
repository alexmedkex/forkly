import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'
import './types'

const port = config.get('express.port')
const dbUrl = config.get('mongo.url').toString()
const logLevel = config.get('loglevel')

axios.defaults.timeout = config.get('axios.timeout')
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-magic-link')
const logger = getLogger('Server')
logger.addLoggingToAxios(axios)
const server = new Server(logger)

DataAccess.setUrl(dbUrl)
DataAccess.connect()

RegisterRoutes(server.express)
server
  .addRequestIdHeaderToAxios(axios)
  .setForwardAxiosErrors(true)
  .setServiceName('api-magic-link')
  .setLogConfig(logLevel as any)
  .withErrorHandlers()
server.startOn(port as any)
