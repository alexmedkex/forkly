import { Container } from 'inversify'
import logger, { LogLevel } from '@komgo/logging'
import { IContainer,MongoContainer } from '@komgo/integration-test-utilities'
import { Collection } from 'mongoose'

// Log only critical messages
process.env.LOG_LEVEL = LogLevel.Info

export class IntegrationEnvironment {
  public iocContainer: Container
  private serverModule: any
  private readonly mongoContainer: IContainer

  constructor() {
    this.mongoContainer = new MongoContainer()
  }

  public async setup() {
    this.iocContainer = await this.setupInversifyContainer()
  }

  public async start() {
    logger.info('Starting mongo container')
    await this.startMongo()
    logger.info('Starting server')
    this.serverModule = await import('../../src/server')
    await this.serverModule.startServer()
  }

  public async stopServer() {
    await this.serverModule.stopServer()
  }

  public async afterAll() {
    await this.serverModule.stopServer()
    await this.mongoContainer.delete()
  }

  public async cleanCollection(collection: Collection) {
    try {
      await collection.deleteMany({})
    } catch (error) {
      console.log(error)
    }
  }

  private async startMongo() {
    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()
  }

  private async setupInversifyContainer(): Promise<Container> {
    const iocContainerModule = await import('../../src/inversify/ioc')
    return iocContainerModule.iocContainer
  }
}
