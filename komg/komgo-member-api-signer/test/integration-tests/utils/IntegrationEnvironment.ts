import Axios, { AxiosInstance } from 'axios'
import { Collection } from 'mongoose'

import {
  IContainer,
  MongoContainer
} from '@komgo/integration-test-utilities'
import logger, { LogLevel } from '@komgo/logging'

import { Key } from '../../../src/data-layer/models/key'

// Log only critical messages
process.env.LOG_LEVEL = LogLevel.Crit

import { iocContainer } from '../../../src/inversify/ioc'
import { startServer, stopServer } from '../../../src/server'

import { API_SIGNER_BASE_URL, JSON_MIME_TYPE, REQUEST_ID } from './constants'
import { IMockedIds } from './types'
import { sleep, waitUntilServerIsUp } from './utils'

export default class IntegrationEnvironment {
  public mockedIds: IMockedIds
  public axiosInstance: AxiosInstance

  private mongoContainer: IContainer

  constructor(private readonly withServer: boolean = true) {
    this.axiosInstance = Axios.create({
      baseURL: API_SIGNER_BASE_URL,
      timeout: 120 * 1000,
      headers: { 'Content-Type': JSON_MIME_TYPE, 'X-Request-ID': REQUEST_ID }
    })

    this.mongoContainer = new MongoContainer()
  }

  public async beforeEach() {
     // Start server
     if (this.withServer) {
      logger.info('START server')
       await this.startServer()
     }
  }

  public async beforeAll() {
    await this.mongoContainer.start()
    await this.mongoContainer.waitFor()
  }

  public async afterEach() {
    await sleep(100) // wait for acks()

    if (this.withServer) {
      await this.stopServer()
    }
  }

  public async afterAll() {
    await this.mongoContainer.delete()
  }

  public async startServer() {
    await startServer(false)
    await waitUntilServerIsUp(API_SIGNER_BASE_URL)
  }

  public async stopServer() {
    await stopServer()
  }

  public async getAPISigner(path: string) {
    return this.axiosInstance.get(`${API_SIGNER_BASE_URL}/${path}`)
  }

  public async cleanKeyDataCollection() {
    await this.cleanCollection(Key.collection)
  }

  private async cleanCollection(collection: Collection) {
    try {
      await collection.drop()
    } catch (error) {
      // Do nothing (collection does not exist in DB)
    }
  }
}
