import * as config from 'config'
import DataAccess from '@komgo/data-access'
import { configureLogging, getLogger, LogstashCapableLogger } from '@komgo/logging'
import { Server, requestStorageInstance } from '@komgo/microservice-config'
import axios from 'axios'
import './service-layer/controllers'
import { TYPES } from './inversify/types'
import { iocContainer } from './inversify/ioc'
import { RegisterRoutes } from './middleware/server-config/routes'
import IService from './business-layer/IService'
// tslint:disable-next-line
import 'source-map-support/register'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from './exceptions/utils'

configureLogging('api-trade-finance')
getLogger('Axios').addLoggingToAxios(axios)
LogstashCapableLogger.addRequestStorage(requestStorageInstance)

const port = config.get('express.port')
const logLevel = config.get('loglevel')
const dbUrl = config.get('mongo.url').toString()
const server = new Server(getLogger('Server'))

RegisterRoutes(server.express)

let serverInstance
export const runServer = async (withAutoReconnect: boolean = true) => {
  DataAccess.setUrl(dbUrl)
  DataAccess.setAutoReconnect(withAutoReconnect)
  DataAccess.connect()
  serverInstance = await server
    .addRequestIdHeaderToAxios(axios)
    .setForwardAxiosErrors(true)
    .setLogConfig(logLevel as any)
    .withErrorHandlers()
    .startOn(port as any)
}

const serverLogger = getLogger('run-server')

export async function startEventService() {
  const processor: IService = iocContainer.get<IService>(TYPES.MessageProcessor)
  try {
    await processor.start()
  } catch (error) {
    serverLogger.error(
      ErrorCode.Configuration,
      ErrorNames.RunServerFailed,
      'Error when starting service to listen from Internal-MQ',
      {
        error
      }
    )
  }
  serverLogger.info('Service started')
}

export const stopServer = async () => {
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

export const stopService = async () => {
  serverLogger.info('Stopping service')
  const processor: IService = iocContainer.get<IService>(TYPES.MessageProcessor)
  try {
    await processor.stop()
    await serverInstance.close()
    DataAccess.disconnect()
  } catch (error) {
    serverLogger.warn(ErrorCode.Configuration, ErrorNames.StopServerFailed, 'Error when stopping service', {
      error: 'StopServiceFailed',
      errorMessage: error.message
    })
  }
}

export default stopService
