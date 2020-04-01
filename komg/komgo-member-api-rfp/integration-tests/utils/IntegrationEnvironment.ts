import DataAccess from '@komgo/data-access'
import { AMQPConfig, IContainer, MongoContainer, RabbitMQContainer } from '@komgo/integration-test-utilities'
import logger from '@komgo/logging'
import express = require('express')
import { Server } from 'http'
import { Container } from 'inversify'

import { MOCK_COMPANY_ENTRY } from './mock-data'

export default class IntegrationEnvironment {
  public static readonly COMPANY_STATIC_ID = 'ServerSetCompanyStaticId'
  public amqpConfig: AMQPConfig
  private readonly API_REGISRY_BASE_URL = 'http://localhost:8082'
  private iocContainer: Container
  private serverModule

  private rabbitContainer: IContainer
  private mongoContainer: IContainer

  // api-registry
  private apiRegistryMockServer: Server
  private apiRegistryMockApp: express.Application = express()
  private apiRegistryGetHandler = {
    handle: null
  }

  constructor() {
    this.amqpConfig = new AMQPConfig()

    this.rabbitContainer = new RabbitMQContainer(this.amqpConfig)
    this.mongoContainer = new MongoContainer()
  }

  public async beforeAll() {
    this.setEnvironmentVars()
    // dynamically import the ioc container here so it will use the configured env vars
    this.iocContainer = await this.importIocContainer()

    await this.startMongo()
    await this.startRabbitMQ()

    this.serverModule = await import('../../src/server')
    logger.info('START server')
    await this.serverModule.startServer()
  }

  public async afterAll() {
    DataAccess.setAutoReconnect(false)
    await this.serverModule.stopServer()
    await this.rabbitContainer.delete()
    await this.mongoContainer.delete()
  }

  public getIocContainer() {
    return this.iocContainer
  }

  public async stopRabbitMQ() {
    await this.rabbitContainer.stop()
  }

  public async startRabbitMQ() {
    await this.rabbitContainer.start()
    await this.rabbitContainer.waitFor()
  }

  public async pauseMongo() {
    await this.mongoContainer.pause()
  }

  public async unpauseMongo() {
    await this.mongoContainer.unpause()
  }

  public async stopMongo() {
    await this.mongoContainer.stop()
  }

  public async startMongo() {
    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()
  }

  public startApiRegistryMockServer() {
    this.apiRegistryMockServer = this.apiRegistryMockApp.listen(8082)

    this.setApiRegistryGetResponse(200, [MOCK_COMPANY_ENTRY])
    this.apiRegistryMockApp.get('/v0/registry/cache/', (req, res) => this.apiRegistryGetHandler.handle(req, res))
  }

  /**
   * Allows you to dynamically change the api-registry get handler for the route: /v0/registry/cache/
   */
  public setApiRegistryGetResponse(responseStatus: number, responseData: any[] = []) {
    // // respond with the company data
    this.apiRegistryGetHandler.handle = (req, res) => {
      if (responseStatus === 200) {
        // return a company entry
        res.send(responseData)
      } else {
        res.sendStatus(responseStatus)
      }
    }
  }

  public stopApiRegistryMockServer(): Promise<void> {
    return new Promise(resolve => {
      this.apiRegistryMockServer.close(() => {
        resolve()
      })
    })
  }

  private setEnvironmentVars() {
    process.env.COMPANY_STATIC_ID = IntegrationEnvironment.COMPANY_STATIC_ID
    // rabbit mq config
    process.env.INTERNAL_MQ_HOST = this.amqpConfig.host
    process.env.INTERNAL_MQ_USERNAME = this.amqpConfig.username
    process.env.INTERNAL_MQ_PASSWORD = this.amqpConfig.password

    process.env.API_REGISTRY_BASE_URL = this.API_REGISRY_BASE_URL
  }

  private async importIocContainer(): Promise<Container> {
    const iocContainerModule = await import('../../src/inversify/ioc')
    return iocContainerModule.iocContainer
  }
}
