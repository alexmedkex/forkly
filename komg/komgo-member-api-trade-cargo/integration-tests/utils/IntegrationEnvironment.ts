import DataAccess from '@komgo/data-access'
import { iocContainer } from '../../src/inversify/ioc'
import { Container } from 'inversify'
import * as config from 'config'
import { TYPES } from '../../src/inversify/types'
// import IService from '../../src/service-layer/events/IService'
import { MessagingFactory } from '@komgo/messaging-library'
import { getLogger, LogLevel } from '@komgo/logging'
import MockAdapter from 'axios-mock-adapter'

import { MongoContainer, RabbitMQContainer, IContainer, AMQPConfig } from '@komgo/integration-test-utilities'

import { startServer, stopServer } from './run-server'
import { apiroutes } from '../utils/apiroutes'

import IService from '../../src/service-layer/events/IService'
import { getMembers, generateRandomString } from './utils'
import { NotificationManager } from '@komgo/notification-publisher'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../src/utils/Constants'
import { VALUES } from '../../src/inversify/values'

// Log only critical messages
process.env.LOG_LEVEL = LogLevel.Crit

const serverLogger = getLogger('environment-startup-integration')
const rabbitContainer: IContainer = new RabbitMQContainer()
const mongoContainer: IContainer = new MongoContainer()

export class IntegrationEnvironment {
  public container: Container
  public internalPublisherId: string
  public inboundPublisherId: string

  public async start(memberStaticId) {
    // const mockIds = createMockedIds()
    await startEnvironment()
    iocContainer.snapshot()
    // START
    // Required due to the TradeSchema needing access to PROCESS_ENV now as iocContainer not imported there.
    // Alternative was putting it in the TradeSchema which is not as nice.
    process.env.COMPANY_STATIC_ID = memberStaticId
    // END
    this.container = iocRebind(memberStaticId)
    this.inboundPublisherId = generateRandomString(5, 'event-management-')
    this.internalPublisherId = generateRandomString(5, 'trade-cargos-')
    this.container.rebind<string>(VALUES.TradeCargoPublisherId).toConstantValue(this.internalPublisherId)
    this.container.rebind<string>(VALUES.InboundPublisherId).toConstantValue(this.inboundPublisherId)
    await startServer(this.container)
  }

  public async stop(axiosMock: MockAdapter) {
    await stopServer()
    await stopEventService()
    await stopEnvironment()
    iocContainer.restore()
    axiosMock.restore()
  }

  public beforeEach(axiosMock: MockAdapter) {
    axiosMock
      .onGet(apiroutes.registry.getMembers)
      .reply(getMembers)
      .onPost(apiroutes.coverage.autoAdd)
      .reply(200)
      .onPost(apiroutes.notification.create)
      .reply(200)
      .onAny(apiroutes.documents.getDocumentTypes)
      .reply(200, [{ id: 'Q88' }])
      .onGet(apiroutes.tradeFinance.getLc)
      .reply(200, [])
  }
  public afterEach(axiosMock: MockAdapter) {
    axiosMock.reset()
  }
}

export async function startEnvironment() {
  await mongoContainer.start()
  await mongoContainer.waitFor()
  await rabbitContainer.start()
  await rabbitContainer.waitFor()
  await connectToDb()
}

export async function stopEnvironment() {
  await rabbitContainer.delete()
  await mongoContainer.delete()
  await DataAccess.disconnect()
}

export function connectToDb() {
  serverLogger.info('connecting to db')
  return new Promise((resolve, reject) => {
    DataAccess.setUrl(config.get('mongo.url').toString())
    DataAccess.setAutoReconnect(false)

    const db = DataAccess.connection
    db.on('error', function(error) {
      return reject(error)
    })
    db.once('connected', () => {
      // wait for database connection
      serverLogger.info('connected')
      return resolve(db)
    })
    DataAccess.connect()
  })
}

async function stopEventService(): Promise<void> {
  const processor: IService = iocContainer.get<IService>(TYPES.TradeEventService)
  try {
    await processor.stop()
  } catch (error) {
    serverLogger.error(ErrorCode.Connection, ErrorName.StopServiceFailed, 'Error when stopping service')
    serverLogger.error(ErrorCode.Connection, ErrorName.StopServiceFailed, error)
  }
  serverLogger.info('Service stopped')
}
// export async function startEventService(): Promise<void> {
//   const tradeEventService: IService = iocContainer.get<IService>(TYPES.TradeEventService)
//   try {
//     await tradeEventService.start()
//   } catch (error) {
//     serverLogger.error('Error when starting service to listen from Internal-MQ')
//     serverLogger.error(error)
//   }
//   serverLogger.info('Service started')
// }

export function iocRebind(companyStaticId?: string): Container {
  if (companyStaticId) {
    iocContainer.rebind<string>(VALUES.CompanyStaticId).toConstantValue(companyStaticId)
  }
  iocContainer
    .rebind<NotificationManager>(TYPES.NotificationClient)
    .toConstantValue(new NotificationManager('http://api-notif:8080'))
  const amqpConfig = new AMQPConfig()
  iocContainer
    .rebind(TYPES.MessagingFactory)
    .toConstantValue(new MessagingFactory(amqpConfig.host, amqpConfig.username, amqpConfig.password))

  return iocContainer
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
