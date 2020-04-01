import {
  AMQPConfig,
  IContainer,
  MongoContainer,
  PublisherMicroservice,
  RabbitMQContainer
} from '@komgo/integration-test-utilities'
import { getLogger } from '@komgo/logging'
import { MessagingFactory } from '@komgo/messaging-library'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import MockAdapter from 'axios-mock-adapter'
import { Container } from 'inversify'
import { RequestClient } from '../../src/business-layer/messaging/RequestClient'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { CoverageEventProcessor } from '../../src/service-layer/events/CoverageEventProcessor'
import IService from '../../src/service-layer/events/IService'
import { members } from '../sampledata/members'
import { apiroutes } from './apiroutes'
import MessageConsumerService from './MessageConsumerService'
import { runServer, stopServer } from './run-server'
import { ConsumerWatchdogFactory } from '../../src/business-layer/messaging/ConsumerWatchdogFactory'
import { ErrorCode } from '@komgo/error-utilities'

jest.unmock('@komgo/logging')

const rabbitContainer: IContainer = new RabbitMQContainer()
const mongoContainer: IContainer = new MongoContainer()
const serverLogger = getLogger('environment-startup-integration')

export class IntegrationEnvironment {
  public publisher: PublisherMicroservice
  public consumer: MessageConsumerService
  public axiosMock: MockAdapter
  public container: Container

  public async start(companyStaticId) {
    const mockIds = createMockedIds()

    await startEnvironment()

    iocContainer.snapshot()
    this.container = iocRebind(companyStaticId)
    this.container.rebind<string>('outbound-publisher').toConstantValue(mockIds.consumerId)
    this.container.rebind<string>('inbound-publisher').toConstantValue(mockIds.publisherId)

    this.consumer = new MessageConsumerService(mockIds.consumerId)
    this.publisher = new PublisherMicroservice(mockIds.publisherId)

    await runServer(this.container)
    await this.publisher.beforeEach()
  }

  public async stop(axiosMock: MockAdapter) {
    await this.publisher.afterEach()
    await stopServer(this.container)
    await stopEnvironment()
    iocContainer.restore()
    axiosMock.restore()
  }

  public async beforeEach(axiosMock: MockAdapter) {
    axiosMock.reset()
    axiosMock
      .onAny(apiroutes.registry.getMembers)
      .reply(async reqConfig => {
        let result = members.find(
          member => reqConfig.url.includes(member.vaktStaticId) || reqConfig.url.includes(member.staticId)
        )
        if (!result) {
          result = members[1]
        }
        return [200, [result]]
      })
      .onAny(apiroutes.notification.create)
      .reply(200)
      .onAny(apiroutes.notification.task)
      .reply(200)

    await this.consumer.beforeEach()
    await sleep(1000)
  }

  public async afterEach(axiosMock: MockAdapter) {
    await this.consumer.afterEach()
  }
}

export async function startEnvironment() {
  await mongoContainer.start()
  await mongoContainer.waitFor()
  await rabbitContainer.start()
  await rabbitContainer.waitFor()
}

export async function stopEnvironment() {
  await rabbitContainer.delete()
  await mongoContainer.delete()
}

export function iocRebind(companyStaticId?: string, mockIds?: any): Container {
  if (companyStaticId) {
    iocContainer.rebind<string>('company-static-id').toConstantValue(companyStaticId)
  }

  if (mockIds) {
    iocContainer.rebind<string>('outbound-publisher').toConstantValue(mockIds.consumerId)
    iocContainer.rebind<string>('inbound-publisher').toConstantValue(mockIds.publisherId)
  }

  const amqpConfig = new AMQPConfig()
  iocContainer
    .rebind(TYPES.MessagingFactory)
    .toConstantValue(new MessagingFactory(amqpConfig.host, amqpConfig.username, amqpConfig.password))
  iocContainer.rebind<TaskManager>(TYPES.TaskManagerClient).toConstantValue(new TaskManager(`http://api-notif:8080`))
  iocContainer
    .rebind<NotificationManager>(TYPES.NotificationClient)
    .toConstantValue(new NotificationManager(`http://api-notif:8080`))

  iocContainer
    .rebind(TYPES.ConsumerWatchdogFactory)
    .to(ConsumerWatchdogFactory)
    .inSingletonScope()
  iocContainer
    .rebind(TYPES.RequestClient)
    .to(RequestClient)
    .inSingletonScope()

  iocContainer
    .rebind<IService>(TYPES.CoverageEventProcessor)
    .to(CoverageEventProcessor)
    .inSingletonScope()
  return iocContainer
}

export async function startEventService(container: Container) {
  try {
    await container.get<IService>(TYPES.CoverageEventProcessor).start()
  } catch (error) {
    serverLogger.error(
      ErrorCode.ConnectionInternalMQ,
      'Error when starting service to listen from Internal-MQ',
      error.message
    )
  }
}

export async function stopEventService(container: Container) {
  try {
    await container.get<IService>(TYPES.CoverageEventProcessor).stop()
  } catch (error) {
    serverLogger.error(
      ErrorCode.ConnectionInternalMQ,
      'Error when starting service to listen from Internal-MQ',
      error.message
    )
  }
}

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const createMockedIds: () => {
  publisherId: string
  publisherIdDeadExchange: string
  publisherIdDeadQueue: string
  consumerId: string
  consumerIdDeadExchange: string
  consumerIdDeadQueue: string
} = () => {
  const publisherId = generateRandomString(7, 'publisherId-')
  const consumerId = generateRandomString(7, 'consumerId-')
  return {
    publisherId,
    publisherIdDeadExchange: `${publisherId}.dead`,
    publisherIdDeadQueue: `${publisherId}.dead`,
    consumerId,
    consumerIdDeadExchange: `${consumerId}.dead`,
    consumerIdDeadQueue: `${consumerId}.dead`
  }
}
