import DataAccess from '@komgo/data-access'
import { MongoContainer, RabbitMQContainer, IContainer, AMQPConfig } from '@komgo/integration-test-utilities'
import { LogstashCapableLogger, configureLogging, LogLevel } from '@komgo/logging'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as config from 'config'

// Log only critical messages
process.env.LOG_LEVEL = LogLevel.Crit

import { iocContainer } from '../../../src/inversify/ioc'
import CommonMessagingAgent from '../../../src/messaging-layer/CommonMessagingAgent'
import requestIdHandlerInstance from '../../../src/util/RequestIdHandler'

import { IMockedIds } from './types'
import { createIntraMQs, createMockedIds, sleep, deleteInternalMQs, deleteIntraMQs } from './utils'

export default class IntegrationEnvironment {
  axiosMock: MockAdapter
  mockedIds: IMockedIds
  intraMessaging: CommonMessagingAgent
  amqpConfig: AMQPConfig

  private rabbitContainer: IContainer
  private mongoContainer: IContainer

  constructor() {
    this.axiosMock = new MockAdapter(axios)
    this.amqpConfig = new AMQPConfig()

    this.rabbitContainer = new RabbitMQContainer(this.amqpConfig)
    this.mongoContainer = new MongoContainer()
  }

  public async beforeAll() {
    LogstashCapableLogger.addRequestStorage(requestIdHandlerInstance)

    await this.mongoContainer.start()
    await this.rabbitContainer.start()

    await this.mongoContainer.waitFor()
    await this.rabbitContainer.waitFor()

    // connect to MongoDB
    DataAccess.setUrl(config.get('mongo.url').toString())
    DataAccess.setAutoReconnect(false)
    DataAccess.connect()

    iocContainer.snapshot()
  }

  public async beforeEach() {
    this.axiosMock.reset()
    this.mockedIds = createMockedIds()
    await createIntraMQs(this.mockedIds, this.amqpConfig)

    // rebind values for the test
    iocContainer.rebind<number>('common-broker-polling-interval-ms').toConstantValue(0)
    iocContainer.rebind<string>('api-signer-base-url').toConstantValue('http://api-signer:3107')
    iocContainer.rebind<string>('common-mq-base-url').toConstantValue(this.amqpConfig.httpUrl)
    iocContainer.rebind<string>('common-mq-username').toConstantValue(this.amqpConfig.username)
    iocContainer.rebind<string>('common-mq-password').toConstantValue(this.amqpConfig.password)

    // rebind the IDs with Mocked IDs (generated)
    iocContainer.rebind('consumer-id').toConstantValue(this.mockedIds.eventConsumerId)
    iocContainer.rebind('to-publisher-id').toConstantValue(this.mockedIds.eventToPublisherId)
    iocContainer.rebind('from-publisher-id').toConstantValue(this.mockedIds.eventFromPublisherId)
    iocContainer.rebind('company-static-id').toConstantValue(this.mockedIds.companyStaticId)
    iocContainer.rebind('outbound-routing-key').toConstantValue(this.mockedIds.outboundRoutingKey)
    iocContainer.rebind('outbound-vakt-exchange').toConstantValue(this.mockedIds.outboundVaktExchange)
    iocContainer.rebind('outbound-monitoring-exchange').toConstantValue(this.mockedIds.outboundMonitoringExchange)
  }

  public async afterEach() {
    await sleep(100) // wait for acks()
    await deleteInternalMQs(this.mockedIds, this.amqpConfig)
    await deleteIntraMQs(this.mockedIds, this.amqpConfig)
  }

  public async afterAll() {
    DataAccess.disconnect() // disconnect from MongoDB
    iocContainer.restore()
    await this.rabbitContainer.delete()
    await this.mongoContainer.delete()
  }
}
