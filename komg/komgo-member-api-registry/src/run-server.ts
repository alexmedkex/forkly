import DataAccess from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance } from '@komgo/microservice-config'
import axios from 'axios'
import * as config from 'config'

import { ErrorNames } from './exceptions/utils'
import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { RegisterRoutes } from './middleware/server-config/routes'
import { CachePopulationStateHolder, PopulationState } from './service-layer/cache/CachePopulationStateHolder'
import IRegistryCachePopulationService from './service-layer/cache/IRegistryCachePopulationService'
import './service-layer/controllers/AttributeController'
import './service-layer/controllers/EthPubKeyController'
import './service-layer/controllers/HealthController'
import './service-layer/controllers/RegistryCacheController'
import './types'

LogstashCapableLogger.addRequestStorage(requestStorageInstance)
configureLogging('api-registry')
const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()

const runServer = async () => {
  // Prepare server:
  const server = new Server(getLogger('Server'))
  RegisterRoutes(server.express)
  DataAccess.setUrl(dbUrl)
  DataAccess.connect()

  // Start server:
  server
    .addRequestIdHeaderToAxios(axios)
    .setServiceName('api-registry')
    .setLogConfig(logLevel as any)
    .withErrorHandlers()
  await server.startOn(port as any)

  // Populate with data:
  if (process.env.PREPOPULATE_AND_START_SERVICE_AT_STARTUP) {
    DataAccess.connection.once('connected', async () => {
      const registryCachePopulationService: IRegistryCachePopulationService = iocContainer.get<
        IRegistryCachePopulationService
      >(TYPES.RegistryCachePopulationService)
      const success = await registryCachePopulationService.clearPopulateAndStartService()
      if (!success) {
        getLogger('run-server').error(
          ErrorCode.UnexpectedError,
          ErrorNames.ExitProcessError,
          'Exiting process - There was an error starting service'
        )
        process.exit(1)
      }
    })
  } else {
    const cachePopulationStateHolder = iocContainer.get<CachePopulationStateHolder>(TYPES.CachePopulationStateHolder)
    cachePopulationStateHolder.setState(PopulationState.Complete)
  }
}

runServer()
