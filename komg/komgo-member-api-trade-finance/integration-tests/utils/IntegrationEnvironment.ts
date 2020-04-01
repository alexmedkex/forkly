import DataAccess from '@komgo/data-access'
import { Server } from 'http'
import { IContainer, MongoContainer, RabbitMQContainer, AMQPConfig } from '@komgo/integration-test-utilities'
import * as config from 'config'
import { LCRepo } from '../../src/data-layer/mongodb/LCRepo'
import express = require('express')
import logger, { LogLevel } from '@komgo/logging'
import { Container } from 'inversify'
import { Collection } from 'mongoose'

export class IntegrationEnvironment {
  public iocContainer: Container
  private amqpConfig: AMQPConfig = new AMQPConfig()
  private serverModule: any
  private mongoContainer: IContainer = new MongoContainer()
  private rabbitContainer: IContainer = new RabbitMQContainer(this.amqpConfig)
  private apiDocsMockApp: express.Application = express()
  private apiDocsServer: Server

  public async setupContainers() {
    await this.startContainers()
    await this.connectToDatabase()
  }

  public async startMongoContainer() {
    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()
  }

  public async startRabbitContainer() {
    await this.rabbitContainer.start()
    await this.rabbitContainer.waitFor()
  }

  public async emptyLcRepo() {
    try {
      await LCRepo.collection.drop()
    } catch (e) {
      // do nothing
    }
  }

  public async setup(companyStaticId: string = 'companyStaticId') {
    this.setupEnvironmentVars(companyStaticId)
    this.iocContainer = await this.setupInversifyContainer()
  }

  public async startServer() {
    logger.info('Starting server')
    this.serverModule = await import('../../src/server')
    await this.serverModule.runServer(true)
    await this.serverModule.startEventService()
  }

  public async start() {
    logger.info('Starting mongo container')
    await this.startMongo()
    await this.startServer()
  }

  public async stopServer() {
    await this.serverModule.stopServer()
    await this.serverModule.stopService()
  }

  public setupEnvironmentVars(companyStaticId?: string) {
    if (companyStaticId) process.env.COMPANY_STATIC_ID = companyStaticId
    // set the rabbit mq connection details before the iocContainer is imported as it requires them
    // for the MessageProcessor that connects to the queue
    process.env.INTERNAL_MQ_HOST = 'localhost'
    process.env.INTERNAL_MQ_USERNAME = 'guest'
    process.env.INTERNAL_MQ_PASSWORD = 'guest'
    // set the api-documents microservice url to a express server set up during tests
    process.env.API_DOCUMENTS_BASE_URL = 'http://localhost:8081'

    // turn the logging down so the test run is not unreadable
    process.env.LOG_LEVEL = LogLevel.Info
  }

  private async startMongo() {
    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()
  }

  public startApiDocsMockServer() {
    // Create a new express application instance
    this.apiDocsServer = this.apiDocsMockApp.listen(8081)
    // respond with the fake document hash it expects when it receives the request
    this.apiDocsMockApp.post('/v0/products/*', (req, res) => {
      res.send({ hash: '0x012345' })
    })
  }

  public stopApiDocsMockServer(): Promise<void> {
    return new Promise(resolve => {
      this.apiDocsServer.close(() => {
        resolve()
      })
    })
  }

  public async tearDown() {
    console.log('TearDown from IntegrationEnvironment')
    DataAccess.setAutoReconnect(false)
    await DataAccess.disconnect()
  }

  public async tearDownContainers() {
    console.log('TearDownContainers from IntegrationEnvironment')
    DataAccess.setAutoReconnect(false)
    await DataAccess.disconnect()
    await this.mongoContainer.delete()
    await this.rabbitContainer.delete()
  }

  public getIocContainer(): any {
    return this.iocContainer
  }

  public sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public async cleanCollection(collection: Collection) {
    try {
      await collection.deleteMany({})
    } catch (error) {
      console.log(error)
    }
  }

  private async startContainers() {
    await this.startMongo()
    await this.rabbitContainer.start()
    await this.rabbitContainer.waitFor()
  }

  private async setupInversifyContainer(): Promise<Container> {
    const iocContainerModule = await import('../../src/inversify/ioc')
    return iocContainerModule.iocContainer
  }

  private async connectToDatabase() {
    console.log('connecting to db')
    return new Promise((resolve, reject) => {
      DataAccess.setUrl(config.get('mongo.url').toString())
      DataAccess.setAutoReconnect(false)

      const db = DataAccess.connection
      db.on('error', function(error) {
        console.log('DB ERROR: ', error)
        return reject(error)
      })
      db.once('connected', () => {
        // wait for database connection
        console.log('connected')
        return resolve(db)
      })
      DataAccess.connect()
    })
  }
}
