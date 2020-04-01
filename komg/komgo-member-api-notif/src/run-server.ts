import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { requestStorageInstance, Server } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { RegisterRoutes } from './routes'
import './service-layer/controllers/HealthController'
import './service-layer/controllers/NotificationsController'
import './service-layer/controllers/TasksController'

const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()
axios.defaults.timeout = config.get('axios.timeout')
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-notif')
const logger = getLogger('Server')
logger.addLoggingToAxios(axios)
const server = new Server(logger)

DataAccess.setUrl(dbUrl)
DataAccess.connect()

RegisterRoutes(server.express)

server
  .addRequestIdHeaderToAxios(axios)
  .setForwardAxiosErrors(true)
  .setServiceName('api-notif')
  .setLogConfig(logLevel as any)
  .withErrorHandlers()
server.startOn(port as any)
