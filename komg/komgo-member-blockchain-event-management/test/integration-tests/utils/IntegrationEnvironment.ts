import { Web3Wrapper } from '@komgo/blockchain-access'
import DataAccess from '@komgo/data-access'
import {
  MongoContainer,
  RabbitMQContainer,
  QuorumContainer,
  IContainer,
  AMQPConfig,
  NetworkUtils,
  SquidContainer
} from '@komgo/integration-test-utilities'
import { LogstashCapableLogger, configureLogging, LogLevel } from '@komgo/logging'
import { MessagingFactory, IRequestIdHandler } from '@komgo/messaging-library'
import config from 'config'
import { Collection } from 'mongoose'
import Web3 from 'web3'

// Log only critical messages
process.env.LOG_LEVEL = LogLevel.Crit

import { AutoWhitelist } from '../../../src/data-layer/models/auto-whitelist'
import { ContractAddress } from '../../../src/data-layer/models/contract-address'
import { iocContainer } from '../../../src/inversify/ioc'
import { TYPES } from '../../../src/inversify/types'
import { VALUES } from '../../../src/inversify/values'
import requestIdHandlerInstance from '../../../src/util/RequestIdHandler'

import Member from './Member'
import { IMockedIds } from './types'
import { createMockedIds, sleep, deleteInternalMQs } from './utils'

/**
 * To understand 3rd arguments:
 * see https://github.com/EdsonAlcala/quorum-n-nodes/tree/master/keys
 */
export const members = [
  new Member('localhost', '22001', 'TjVj9sgJh8henqtgYIlPp3wQLT/LQWSIheCgJ/C2/Xk='),
  new Member('localhost', '22002', 'iO8XbAo/r8yHU+f1RK8evDW+vYmiUkxHXb98JIsPCw8='),
  new Member('localhost', '22003', 'ZZt+FosKi+Igy2fhZk9P1CI/H4gH+hZHs/PyJzpBvnk='),
  new Member('localhost', '22003', '6sZxEHbvf5OHx1fWXVbDo1Vv+J6oImhUDUmTm8RfH2g=')
]

export const QUORUM_HOST = 'localhost'
export const QUORUM_PORT = '22001'

export interface IEnvironmentConfiguration {
  rabbit: boolean
}

export default class IntegrationEnvironment {
  public mockedIds: IMockedIds
  public amqpConfig: AMQPConfig

  private rabbitContainer: IContainer
  private mongoContainer: IContainer
  private quorumContainer: QuorumContainer
  private squidContainer: SquidContainer

  constructor(private readonly withQuorum = true, private readonly withRabbitMQ = true) {
    this.mongoContainer = new MongoContainer()
    if (this.withQuorum) {
      this.quorumContainer = new QuorumContainer()
    }
    if (this.withRabbitMQ) {
      this.amqpConfig = new AMQPConfig()
      this.rabbitContainer = new RabbitMQContainer(this.amqpConfig)
    }
  }

  public async beforeAll(): Promise<Web3 | undefined> {
    configureLogging('blk-event-mgnt-integration-test')
    LogstashCapableLogger.addRequestStorage(requestIdHandlerInstance)

    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()

    await sleep(2000)

    let web3: Web3
    if (this.withRabbitMQ) {
      await this.rabbitContainer.start()
      await this.rabbitContainer.waitFor()
    }

    if (this.withQuorum) {
      // create a networkID for quorum and squid proxy to use. Required so squid can access the quorum container via
      // its hostname
      const proxyNetworkId = await NetworkUtils.createNetwork()

      await this.quorumContainer.start({ networkMode: proxyNetworkId })
      await this.quorumContainer.waitFor()

      this.squidContainer = new SquidContainer()
      await this.squidContainer.start({ networkMode: proxyNetworkId })
      await this.squidContainer.waitFor()

      // WebWrapper uses the proxy env var to setup the proxy address in web3
      process.env.HTTP_PROXY = this.squidContainer.getProxyHostAddress()
      // Web3 will point at the quorum hostname in the docker network (containerName = hostname)
      web3 = new Web3Wrapper(this.quorumContainer.containerName(), QUORUM_PORT).web3Instance
      iocContainer.rebind(TYPES.Web3Instance).toConstantValue(web3)
      iocContainer.rebind(VALUES.HTTPProxy).toConstantValue(this.squidContainer.getProxyHostAddress())
      iocContainer
        .rebind(VALUES.BlockchainURL)
        .toConstantValue(`http://${this.quorumContainer.containerName()}:${QUORUM_PORT}`)
    }

    // connect to MongoDB
    DataAccess.setUrl(config.get('mongo.url').toString())
    DataAccess.setAutoReconnect(false)
    DataAccess.connect()

    iocContainer.snapshot()

    if (this.withRabbitMQ) {
      // Rebind ioc container
      this.mockedIds = createMockedIds()

      iocContainer.rebind(VALUES.PublisherId).toConstantValue(this.mockedIds.publisherId)
      iocContainer
        .rebind(TYPES.MessagingFactory)
        .toConstantValue(
          new MessagingFactory(
            this.amqpConfig.host,
            this.amqpConfig.username,
            this.amqpConfig.password,
            iocContainer.get<IRequestIdHandler>(VALUES.RequestIdHandler)
          )
        )
    }

    return web3
  }

  public async afterEach() {
    await sleep(1000)

    if (this.withRabbitMQ) {
      await deleteInternalMQs(this.mockedIds, this.amqpConfig)
    }
  }

  public async afterAll() {
    DataAccess.disconnect() // disconnect from MongoDB
    iocContainer.restore()

    await this.mongoContainer.delete()

    if (this.withRabbitMQ) {
      await this.rabbitContainer.delete()
    }
    if (this.withQuorum) {
      await this.quorumContainer.delete()
      await this.squidContainer.delete()

      await NetworkUtils.removeTestNetwork()
    }
  }

  public async pauseQuorumFor(sleepTime: number) {
    await this.quorumContainer.pause()
    await sleep(sleepTime)
    await this.quorumContainer.unpause()
  }

  public async waitForProxiedQuorumAvailability() {
    await this.quorumContainer.waitFor(this.quorumContainer.containerName(), QUORUM_PORT)
  }

  public async cleanAutoWhitelist() {
    await this.cleanCollection(AutoWhitelist.collection)
  }

  public async cleanContractAddress() {
    await this.cleanCollection(ContractAddress.collection)
  }

  private async cleanCollection(collection: Collection) {
    try {
      await collection.deleteMany({})
    } catch (error) {
      // Do nothing
    }
  }
}
