import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance, RegisterRoutes as RegisterMigrateRoutes } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'
import './types'

const port = config.get('express.port')
const logLevel = config.get('loglevel')

axios.defaults.timeout = config.get('axios.timeout')
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-roles')
const logger = getLogger('Server')
const server = new Server(logger)

RegisterRoutes(server.express)
RegisterMigrateRoutes(server.express)
DataAccess.setAutoReconnect(false)

let serverInstance
export const startServer = (withAutoReconnect: boolean = true) => {
  const dbUrl = config.get('mongo.url').toString()
  DataAccess.setUrl(dbUrl)
  DataAccess.setAutoReconnect(withAutoReconnect)
  DataAccess.connect()

  serverInstance = server
    .setServiceName('api-roles')
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .setLogConfig(logLevel as any)
    .withErrorHandlers()
    .startOn(port as any)
}

export const stopServer = () => {
  if (serverInstance !== undefined) {
    return new Promise(resolve => {
      serverInstance.close(() => {
        DataAccess.disconnect()
        resolve()
      })
    })
  } else {
    throw new Error('Server has not been started yet')
  }
}

if (require.main === module) {
  startServer(true)
}
