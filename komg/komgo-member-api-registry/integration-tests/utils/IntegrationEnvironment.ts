import DataAccess from '@komgo/data-access'
import { IContainer, MongoContainer, RabbitMQContainer, AMQPConfig, GanacheContainer } from '@komgo/integration-test-utilities'
import { LogLevel } from '@komgo/logging'
import * as config from 'config'


export class IntegrationEnvironment {
  private amqpConfig: AMQPConfig = new AMQPConfig()
  private mongoContainer: IContainer = new MongoContainer()
  private rabbitContainer: IContainer = new RabbitMQContainer(this.amqpConfig)
  private ganacheContainer: IContainer = new GanacheContainer()

  public async setupContainers() {
    await this.startContainers()
  }

  public setupEnvironmentVars(companyId) {
    process.env.COMPANY_STATIC_ID = companyId

    // set the rabbit mq connection details before the iocContainer is imported as it requires them
    // for the MessageProcessor that connects to the queue
    process.env.INTERNAL_MQ_HOST = 'localhost'
    process.env.INTERNAL_MQ_USERNAME = 'guest'
    process.env.INTERNAL_MQ_PASSWORD = 'guest'

    // set the api-documents microservice url to a express server set up during tests
    process.env.API_DOCUMENTS_BASE_URL = 'http://localhost:8081'
    
    process.env.ENS_REGISTRY_CONTRACT_ADDRESS = '0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4'

    // turn the logging down so the test run is not unreadable
    // process.env.LOG_LEVEL = LogLevel.Crit
  }

  public async tearDownContainers() {
    await DataAccess.disconnect()
    await this.mongoContainer.delete()
    await this.rabbitContainer.delete()
    await this.ganacheContainer.delete()
  }

  public async connectToDatabase() {
    return new Promise((resolve, reject) => {
      DataAccess.setUrl(config.get('mongo.url').toString())
      DataAccess.setAutoReconnect(false)

      const db = DataAccess.connection
      db.on('error', function(error) {
        reject(error)
      })
      db.once('connected', () => {
        // wait for database connection
        resolve(db)
      })
      DataAccess.connect()
    })
  }

  private async startContainers() {
    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()
    await this.rabbitContainer.start()
    await this.rabbitContainer.waitFor()
    await this.ganacheContainer.start()
    await this.ganacheContainer.waitFor()
  }
}
