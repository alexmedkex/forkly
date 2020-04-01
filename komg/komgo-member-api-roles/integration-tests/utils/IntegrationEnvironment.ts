process.env.NODE_ENV = 'development'
process.env.DB_MONGO_URL = 'mongodb://localhost:27017/api-roles'

import { MongoContainer } from '@komgo/integration-test-utilities'
import Axios, { AxiosInstance } from 'axios'

import { startServer, stopServer } from '../../src/run-server'

import { waitUntilServerIsUp } from './utils'

const apiRolesUrl = 'http://localhost:8080/v0'

export default class IntegrationEnvironment {
  public axios: AxiosInstance
  private mongoContainer: MongoContainer

  constructor() {
    this.axios = Axios.create({
      baseURL: apiRolesUrl,
      timeout: 60e3,
      headers: { 'Content-Type': 'application/json' }
    })

    this.mongoContainer = new MongoContainer()
  }

  public async beforeAll() {
    await this.mongoContainer.start() // COMMENT for local testing
    await this.mongoContainer.waitFor(5) // COMMENT for local testing
    startServer(false)
    await waitUntilServerIsUp(apiRolesUrl)
  }

  public async afterAll() {
    await this.mongoContainer.delete()
    await stopServer()
  }
}
