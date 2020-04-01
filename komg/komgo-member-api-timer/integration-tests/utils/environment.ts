import {
  AMQPConfig,
  IContainer,
  MongoContainer
} from '@komgo/integration-test-utilities'
import { getLogger } from '@komgo/logging'
import { Container } from 'inversify'
import MockAdapter from 'axios-mock-adapter'
import { TYPES } from '../../src/inversify/types'
import { runServer, stopServer } from './run-server'
import { iocContainer } from '../../src/inversify/ioc'

jest.unmock('@komgo/logging')

const mongoContainer: IContainer = new MongoContainer()

export class IntegrationEnvironment {
  public axiosMock: MockAdapter
  public container: Container

  public async start() {
    await startEnvironment()

    iocContainer.snapshot()
    this.container = iocContainer

    await runServer()
  }

  public async stop(axiosMock: MockAdapter) {
    await stopServer()
    await stopEnvironment()
    axiosMock.restore()
  }

  public async beforeEach(axiosMock: MockAdapter) {
    axiosMock.reset()
  }
}

export async function startEnvironment() {
  await mongoContainer.start()
  await mongoContainer.waitFor()
}

export async function stopEnvironment() {
  await mongoContainer.delete()
}

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}