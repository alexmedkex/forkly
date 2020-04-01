import DataAccess from '@komgo/data-access'
// tslint:disable-next-line: no-submodule-imports
import { sleep } from '@komgo/integration-test-utilities/dist/utils'
import logger from '@komgo/logging'
import { Container } from 'inversify'

export default class IntegrationEnvironment {
  public iocContainer: Container

  private serverModule: any

  constructor(companyStaticId: string) {
    process.env.COMPANY_STATIC_ID = companyStaticId
  }

  public async setup() {
    this.iocContainer = await this.setupInversifyContainer()
  }

  public async start() {
    logger.info('Starting server...')

    this.serverModule = await import('../../src/server')
    await this.serverModule.startServer()
  }

  public async afterAll() {
    DataAccess.setAutoReconnect(false)
    await sleep(100)
    await this.serverModule.stopServer()
  }

  private async setupInversifyContainer(): Promise<Container> {
    const iocContainerModule = await import('../../src/inversify/ioc')
    return iocContainerModule.iocContainer
  }
}
