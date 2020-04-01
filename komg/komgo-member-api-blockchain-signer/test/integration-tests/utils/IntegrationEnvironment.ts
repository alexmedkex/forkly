import {
  AMQPConfig,
  IContainer,
  MongoContainer,
  QuorumContainer,
  RabbitMQContainer
} from '@komgo/integration-test-utilities'
import logger, { LogLevel } from '@komgo/logging'
import { MessagingFactory } from '@komgo/messaging-library'
import Axios, { AxiosInstance } from 'axios'
import { Collection } from 'mongoose'

import { AddrIndex } from '../../../src/data-layer/models/addr-index'
import { Key } from '../../../src/data-layer/models/key'
import { Transaction } from '../../../src/data-layer/models/transaction'

// Log only critical messages
process.env.LOG_LEVEL = LogLevel.Crit

import { iocContainer } from '../../../src/inversify/ioc'
import { TYPES } from '../../../src/inversify/types'
import { INJECTED_VALUES } from '../../../src/inversify/values'
import { startServer, stopServer } from '../../../src/server'

import { API_BLOCKCHAIN_SIGNER_BASE_URL, JSON_MIME_TYPE, REQUEST_ID } from './constants'
import { IMockedIds } from './types'
import { createMockedIds, deleteInternalMQs, sleep, waitUntilServerIsUp } from './utils'

const MNEMONIC = 'buyer try humor into improve thrive fruit funny skate velvet vanish live'
export default class IntegrationEnvironment {
  public mockedIds: IMockedIds
  public amqpConfig: AMQPConfig

  public axiosInstance: AxiosInstance

  private rabbitContainer: IContainer
  private mongoContainer: IContainer
  private quorumContainer: IContainer

  constructor(private readonly cleanBlockchain: boolean = false, private readonly withServer: boolean = true) {
    this.axiosInstance = Axios.create({
      baseURL: API_BLOCKCHAIN_SIGNER_BASE_URL,
      timeout: 120 * 1000,
      headers: { 'Content-Type': JSON_MIME_TYPE, 'X-Request-ID': REQUEST_ID }
    })

    this.amqpConfig = new AMQPConfig()

    this.rabbitContainer = new RabbitMQContainer(this.amqpConfig)
    this.mongoContainer = new MongoContainer()
    this.quorumContainer = new QuorumContainer()
  }

  public async beforeEach(web3) {
    // Rebind services to update the Mocked IDs
    iocContainer.snapshot()
    this.mockedIds = createMockedIds()

    iocContainer.rebind(INJECTED_VALUES.PublisherId).toConstantValue(this.mockedIds.publisherId)
    iocContainer.rebind(INJECTED_VALUES.Web3Instance).toConstantValue(web3)

    iocContainer.rebind(INJECTED_VALUES.PublisherId).toConstantValue(this.mockedIds.publisherId)

    iocContainer
      .rebind(TYPES.MessagingFactory)
      .toConstantValue(new MessagingFactory(this.amqpConfig.host, this.amqpConfig.username, this.amqpConfig.password))

    iocContainer.rebind(INJECTED_VALUES.Mnemonic).toConstantValue(MNEMONIC)
    // Start server
    if (this.withServer) {
      logger.info('START server')
      await this.startServer()
    }
  }

  public async beforeAll() {
    await this.rabbitContainer.start()
    await this.rabbitContainer.waitFor()

    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()

    await this.quorumContainer.start()
    await this.quorumContainer.waitFor()
  }

  public async afterEach() {
    await sleep(100) // wait for acks()
    await deleteInternalMQs(this.mockedIds, this.amqpConfig)

    if (this.withServer) {
      await this.stopServer()
    }
    iocContainer.restore()

    if (this.cleanBlockchain) {
      await this.quorumContainer.restart()
      await this.quorumContainer.waitFor()
    }
  }

  public async afterAll() {
    await this.rabbitContainer.delete()
    await this.mongoContainer.delete()
    await this.quorumContainer.delete()
  }

  public async startServer() {
    await startServer(false)
    await waitUntilServerIsUp(API_BLOCKCHAIN_SIGNER_BASE_URL)
  }

  public async stopServer() {
    await stopServer()
  }

  public async postAPISigner(path: string, data?: any) {
    return this.axiosInstance.post(`${API_BLOCKCHAIN_SIGNER_BASE_URL}/${path}`, data)
  }

  public async getAPISigner(path: string) {
    return this.axiosInstance.get(`${API_BLOCKCHAIN_SIGNER_BASE_URL}/${path}`)
  }

  public async cleanTransactionCollection() {
    await this.cleanCollection(Transaction.collection)
  }

  public async cleanAddrIndexCollection() {
    await this.cleanCollection(AddrIndex.collection)
  }

  public async cleanKeyDataCollection() {
    await this.cleanCollection(Key.collection)
  }

  public async pauseRabbitMQ() {
    await this.rabbitContainer.pause()
  }

  public async unpauseRabbitMQ() {
    await this.rabbitContainer.unpause()
  }

  private async cleanCollection(collection: Collection) {
    try {
      await collection.drop()
    } catch (error) {
      // Do nothing (collection does not exist in DB)
    }
  }
}
