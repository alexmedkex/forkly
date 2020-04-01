import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'
import * as session from 'express-session'

import { keycloakMiddlewareWrapper } from './middleware/common/keycloak'
import { komgoContextMiddleware } from './middleware/common/komgoContext'
import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers/AuthorizationController'
import './service-layer/controllers/HealthController'
import './types'
import memoryStore from './utils/memoryStore'

const port = parseInt(config.get('express.port'), 10)
const logLevel = config.get('loglevel')
const secret = config.get('session.secret')
axios.defaults.timeout = config.get('axios.timeout')
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-auth')
const logger = getLogger('Server')
const server = new Server(logger)

logger.addLoggingToAxios(axios)
server.express.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  })
)

const runServer = async () => {
  server.express.use(komgoContextMiddleware)
  server.express.use(keycloakMiddlewareWrapper)
  await RegisterRoutes(server.express)

  server
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .setServiceName('api-auth')
    .setLogConfig(logLevel as any)
    .withErrorHandlers()

  server.startOn(port as any)
}

runServer()
