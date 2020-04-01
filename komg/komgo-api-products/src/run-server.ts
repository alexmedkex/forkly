import DataAccess from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { RegisterRoutes } from './middleware/server-config/routes'
import './service-layer/controllers'
import ICustomerProductManager from './service-layer/services/ICustomerProductManager'
import './types'
import { ErrorName } from './utils/ErrorName'

const port = config.get('express.port')
const dbUrl = config.get('mongo.url').toString()
const logLevel = config.get('loglevel')
const ensAddress = process.env.ENS_REGISTRY_CONTRACT_ADDRESS

axios.defaults.timeout = config.get('axios.timeout')
LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-products')
const logger = getLogger('Server')

if (!ensAddress) {
  logger.crit(
    ErrorCode.Configuration,
    ErrorName.NoEnsAddressProvided,
    'ENS_REGISTRY_CONTRACT_ADDRESS env var is undefined'
  )
  process.exit(1)
}

const server = new Server(logger)

DataAccess.setUrl(dbUrl)
DataAccess.connect()

DataAccess.connection.once('connected', async () => {
  const productManager = iocContainer.get<ICustomerProductManager>(TYPES.CustomerProductManager)
  await productManager.startEventListener()
})

RegisterRoutes(server.express)
server
  .setServiceName('api-products')
  .setLogConfig(logLevel as any)
  .withErrorHandlers()
server.startOn(port as any)
