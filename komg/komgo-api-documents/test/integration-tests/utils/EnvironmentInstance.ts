import { AMQPConfig, DockerUtility, NetworkUtils, WaitUtils } from '@komgo/integration-test-utilities'
import Axios, { AxiosInstance } from 'axios'
import { exec } from 'child_process'
import { Container } from 'node-docker-api/lib/container'
import * as logger from 'winston'

import IContainerNames from './IContainerNames'
import { createMockedIds, sleep, enhancedAxiosErrorMessage } from './utils'

const mockServerClient = require('mockserver-client').mockServerClient

const util = require('util')
const execPromisified = util.promisify(exec)
Axios.interceptors.response.use(resp => resp, enhancedAxiosErrorMessage)

/**
 * Class that represents an instance of a test environment for a
 * single test file. Responsible for a life cycle of a container
 * for a service under test
 */
export class EnvironmentInstance {
  private mockServerInstance = mockServerClient('localhost', 1080)
  private amqpConfig = new AMQPConfig()
  private dbUrl: string

  private dbName: string
  private server: Container

  constructor(private containerNames: IContainerNames, private networkId, public readonly port: string) {
    logger.info('Creating environment instance with containers: ', JSON.stringify(containerNames))
    const mongoHostname = containerNames.mongoName
    this.dbName = `api-documents-${port}`
    this.dbUrl = `mongodb://${mongoHostname}:27017/${this.dbName}`
  }

  async beforeAll() {
    try {
      await this.runDBMigrations()
      this.server = await this.startApiDocuments()
      await this.waitFor()
      // Wait for indexes to be built
      await sleep(60000)
    } catch (e) {
      logger.error('Failed to start api-documents', e.message)
      logger.error('Failed to start api-documents', e.stack)
    }
  }

  mongoDbUrl(): string {
    return `mongodb://localhost:27017/${this.dbName}`
  }

  public async afterAll() {
    await this.stopApiDocuments()
  }

  serverConnection(): AxiosInstance {
    logger.info(`Creating axios instance for port: ${this.port}`)
    const instance = Axios.create({
      baseURL: `http://localhost:${this.port}/v0`,
      timeout: 10000,
      headers: { ContentType: 'application/json' }
    })
    instance.interceptors.response.use(resp => resp, enhancedAxiosErrorMessage)
    return instance
  }

  serverBaseUrl() {
    return `http://localhost:${this.port}/v0`
  }

  mockServer() {
    return this.mockServerInstance
  }

  async waitFor(): Promise<void> {
    await WaitUtils.httpIsUp(this.serverBaseUrl())
  }

  public apiRoutes() {
    const mockServer = `/${this.port}`

    const apiNotif = `${mockServer}/api-notif/v0`
    const apiRegistry = `${mockServer}/api-registry/v0`
    const apiSigner = `${mockServer}/api-blockchain-signer/v0`
    const apiUsers = `${mockServer}/api-users/v0`

    return {
      notif: {
        tasks: `${apiNotif}/tasks`
      },
      registry: {
        getMembers: `${apiRegistry}/registry/cache.*`
      },
      signer: {
        getKey: `${apiSigner}/one-time-signer/key`,
        sendTransaction: `${apiSigner}/one-time-signer/transaction`,
        sendPublicTransaction: `${apiSigner}/signer/send-tx`,
        sign: `${apiSigner}/signer/sign`
      },
      users: {
        profile: `${apiUsers}/profile`
      }
    }
  }

  public rabbitMqConfig() {
    return createMockedIds(this.port)
  }

  private async startApiDocuments(): Promise<Container> {
    logger.info('Starting API documents')
    const mockServer = `http://${this.containerNames.mockServerName}:1080/${this.port}`

    const apiRegistry = `${mockServer}/api-registry`
    const apiSigner = `${mockServer}/api-blockchain-signer`
    const apiNotif = `${mockServer}/api-notif`
    const apiUsers = `${mockServer}/api-users`

    const imageName = process.env.SERVICE_IMAGE_NAME || 'komgo-api-documents'
    const imageTag = process.env.SERVICE_IMAGE_TAG || 'latest'
    logger.info(`Starting image with tag: ${imageTag}`)

    const { container, name } = await DockerUtility.startContainer({
      imageName,
      tag: imageTag,
      tcpPortBindings: [
        {
          hostPort: this.port,
          containerPort: this.port
        }
      ],
      containerName: `api-documents-${this.port}`,
      environmentVariables: {
        DB_MONGO_URL: this.dbUrl,
        SERVER_PORT: this.port,
        API_BLOCKCHAIN_SIGNER_BASE_URL: apiSigner,
        API_REGISTRY_BASE_URL: apiRegistry,
        SIGNER_API_BASE: '/v0/signer',
        API_NOTIF_BASE_URL: apiNotif,
        INTERNAL_MQ_HOST: this.containerNames.rabbitMqName,
        INTERNAL_MQ_USERNAME: this.amqpConfig.username,
        INTERNAL_MQ_PASSWORD: this.amqpConfig.password,
        BLOCKCHAIN_HOST: this.containerNames.ganacheName,
        BLOCKCHAIN_PORT: '8545',
        API_USERS_BASE_URL: apiUsers
      },
      create: false
    })
    logger.info(`Started api-documents with name ${name}`)
    await NetworkUtils.connectContainer(this.networkId, name)
    return container
  }

  private async stopApiDocuments(): Promise<void> {
    try {
      logger.info(`Stopping api-documents on port: ${this.port}`)
      await this.server.stop()
    } catch (e) {
      logger.error('Failed to stop api-documents: ', e.message)
    }
  }

  private async runDBMigrations() {
    const { stdout, stderr } = await execPromisified(
      `export DB_MONGO_URL=mongodb://localhost:27017/${this.dbName}; npm run migration:up`
    )
    logger.info('stdout:', stdout)
    logger.info('stderr:', stderr)
  }
}
