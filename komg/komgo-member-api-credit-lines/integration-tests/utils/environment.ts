import {
  AMQPConfig,
  RabbitMQContainer,
  IContainer,
  MongoContainer,
  PublisherMicroservice
} from '@komgo/integration-test-utilities'
import { MessagingFactory } from '@komgo/messaging-library'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import MockAdapter from 'axios-mock-adapter'
import { Container } from 'inversify'

import { RequestClient } from '../../src/business-layer/messaging/RequestClient'
import { ShareCreditLineService } from '../../src/business-layer/ShareCreditLineService'
import { BINDINGS } from '../../src/inversify/constants'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import MessageProcessorService from '../../src/service-layer/services/MessageProcessorService'
import { members } from '../sampledata/members'

import { apiroutes } from './apiroutes'
import MessageConsumerService from './MessageConsumerService'
import { runServer, stopServer } from './run-server'

jest.unmock('@komgo/logging')

const mongoContainer: IContainer = new MongoContainer()
const rabbitContainer: IContainer = new RabbitMQContainer()

export class IntegrationEnvironment {
  public axiosMock: MockAdapter
  public container: Container
  public publisher: PublisherMicroservice
  public consumer: MessageConsumerService

  public async start(companyStaticId?: string) {
    await startEnvironment()

    iocContainer.snapshot()
    this.container = iocContainer

    this.setupMessaging(companyStaticId)

    await runServer(iocContainer)
    await this.publisher.beforeEach()
  }

  public async stop(axiosMock: MockAdapter) {
    await this.publisher.afterEach()
    await stopServer(iocContainer)
    await stopEnvironment()
    axiosMock.restore()
    iocContainer.restore()
  }

  public async beforeEach(axiosMock: MockAdapter, companies?) {
    this.resetAxios(axiosMock, companies)
    await this.consumer.beforeEach()
    await sleep(1000)
  }

  public resetAxios(axiosMock: MockAdapter, companies?) {
    axiosMock.reset()
    axiosMock
      .onAny(apiroutes.registry.getCompanies)
      .reply(async reqConfig => {
        const result = getMembers(reqConfig, companies || members)
        if (!result) {
          return [200, []]
        }
        return [200, [result]]
      })
      .onAny(apiroutes.coverage.getCounterparties)
      .reply(async () => {
        // const result = getMembers(reqConfig, companies || members)
        const counterparties = (companies || members).map(counterparty => ({
          staticId: counterparty.staticId,
          hasSWIFTKey: counterparty.hasSWIFTKey,
          isFinancialInstitution: counterparty.isFinancialInstitution,
          isMember: counterparty.isMember,
          x500Name: counterparty.x500Name,
          covered: true,
          coverageRequestId: '',
          timestamp: new Date()
        }))
        return [200, counterparties]
      })
      .onAny(apiroutes.notification.general)
      .reply(200)
      .onAny(apiroutes.notification.create)
      .reply(200)
      .onAny(apiroutes.notification.task)
      .reply(200)
  }

  public async afterEach() {
    await this.consumer.afterEach()
    // await sleep(1000)
  }

  private setupMessaging(companyStaticId?: string) {
    const mockIds = createMockedIds()

    const API_NOTIF_BASE_URL = 'http://api-notif:8080'

    iocContainer.rebind<string>('notifUrl').toConstantValue(API_NOTIF_BASE_URL)
    iocContainer
      .rebind<NotificationManager>(TYPES.NotificationManagerClient)
      .toConstantValue(new NotificationManager(API_NOTIF_BASE_URL))
    iocContainer.rebind<TaskManager>(TYPES.TaskManagerClient).toConstantValue(new TaskManager(API_NOTIF_BASE_URL))

    if (companyStaticId) {
      iocContainer.rebind<string>('company-static-id').toConstantValue(companyStaticId)
    }

    const amqpConfig = new AMQPConfig()
    iocContainer
      .rebind(TYPES.MessagingFactory)
      .toConstantValue(new MessagingFactory(amqpConfig.host, amqpConfig.username, amqpConfig.password))

    this.container.rebind<string>(BINDINGS.OutboundPublisher).toConstantValue(mockIds.consumerId)
    this.container.rebind<string>(BINDINGS.InboundPublisher).toConstantValue(mockIds.publisherId)

    this.consumer = new MessageConsumerService(mockIds.consumerId)
    this.publisher = new PublisherMicroservice(mockIds.publisherId)

    iocContainer
      .rebind(TYPES.RequestClient)
      .to(RequestClient)
      .inSingletonScope()
    iocContainer.rebind<MessageProcessorService>(TYPES.MessageProcessorService).to(MessageProcessorService)
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

function getMembers(reqConfig, companies) {
  const result = companies.find(
    member => reqConfig.url.includes(member.vaktStaticId) || reqConfig.url.includes(member.staticId)
  )
  if (!result) {
    return undefined
  }
  return result // [200, [result]]
}
