import DataAccess from '@komgo/data-access'
import logger, { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance, RegisterRoutes as RegisterMigrateRoutes } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers/HealthController'
import './service-layer/controllers/KeycloakController'
import './service-layer/controllers/MiscellaneousController'
import './service-layer/controllers/ProfileController'
import './service-layer/controllers/RolesController'
import './service-layer/controllers/SettingsController'
import './service-layer/controllers/UsersController'
import './types'

const dbUrl = config.get('mongo.url').toString()

LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-users')
const port = config.get('express.port')
const logLevel = config.get('loglevel')
axios.defaults.timeout = config.get('axios.timeout')
const server = new Server(getLogger('Server'))

logger.addLoggingToAxios(axios)

RegisterRoutes(server.express)
RegisterMigrateRoutes(server.express)

DataAccess.setUrl(dbUrl)
DataAccess.connect()

const runServer = () => {
  server
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .setServiceName('api-users')
    .setLogConfig(logLevel as any)
    .withErrorHandlers()
    .startOn(port as any)
}

runServer()
