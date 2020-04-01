import {
  AMQPConfig,
  BaseContainer,
  DockerUtility,
  GanacheContainer,
  MockServerContainer,
  MongoContainer,
  NetworkUtils,
  RabbitMQContainer,
  waitUntilTrue,
  WaitUtils
} from '@komgo/integration-test-utilities'
import * as logger from 'winston'

import { EnvironmentInstance } from './EnvironmentInstance'
import IContainerNames from './IContainerNames'
import { TestContainer } from './TestContainer'
import { singleProcessBarrier } from './utils'

const getPort = require('get-port')

const amqpConfig: AMQPConfig = new AMQPConfig()

interface IContainerConfig {
  name: string
  waitFor: () => Promise<void>
  container: BaseContainer
}

const mongoConfig = {
  name: 'mongo',
  waitFor: () => WaitUtils.waitForMongo(),
  container: new MongoContainer()
}

const rabbitMqConfig = {
  name: 'rabbitmq',
  waitFor: () => WaitUtils.waitForRabbitMq(amqpConfig),
  container: new RabbitMQContainer()
}

const mockServerConfig = {
  name: 'mock-server',
  waitFor: () => WaitUtils.httpIsUp('http://localhost:1080'),
  container: new MockServerContainer()
}

const ganacheContainer = new GanacheContainer()
const ganacheConfig = {
  name: 'ganache',
  waitFor: () => ganacheContainer.waitFor(),
  container: ganacheContainer
}

/**
 * Create a test environment with specified dependencies.
 * If none of the required containers are created they will be created before creating a test instance.
 * If they are created this method will wait until those dependencies are fully initialized.
 *
 * @param containers list of containers a test instance depends on
 */
export async function createTestInstance(containers: TestContainer[]): Promise<EnvironmentInstance> {
  const networkId: string = await getNetworkId()
  const containerNames = await getContainerNames(containers, networkId)

  const randomPort = await getRandomPort()
  return new EnvironmentInstance(containerNames, networkId, randomPort)
}

async function getNetworkId(): Promise<string> {
  try {
    await singleProcessBarrier('integration-tests.network.lock')
    return NetworkUtils.createNetwork()
  } catch (e) {
    return waitForNetwork()
  }
}

async function waitForNetwork() {
  logger.info('Waiting for a test network to be created')
  await waitUntilTrue(
    {
      timeout: 10000,
      interval: 100
    },
    async () => {
      const network = await NetworkUtils.findTestNetworkId()
      return !!network
    }
  )
  return NetworkUtils.findTestNetworkId()
}

async function getContainerNames(containers: TestContainer[], networkId: string): Promise<IContainerNames> {
  const promises = containers.map(containerType => {
    switch (containerType) {
      case TestContainer.MockServer:
        return initContainer(networkId, mockServerConfig)
      case TestContainer.Mongo:
        return initContainer(networkId, mongoConfig)
      case TestContainer.RabbitMQ:
        return initContainer(networkId, rabbitMqConfig)
      case TestContainer.Ganache:
        return initContainer(networkId, ganacheConfig)
      default:
        return initUnknownContainer(containerType)
    }
  })

  await Promise.all(promises)

  const mongoName = await getContainerNameOrUndefined('mongo')
  const mockServerName = await getContainerNameOrUndefined('mock-server')
  const rabbitMqName = await getContainerNameOrUndefined('rabbitmq')
  const ganacheName = await getContainerNameOrUndefined('ganache')

  return {
    mongoName,
    mockServerName,
    rabbitMqName,
    ganacheName
  }
}

async function initContainer(networkId: string, config: IContainerConfig): Promise<void> {
  try {
    await singleProcessBarrier(`integration-tests.${config.name}.lock`)
  } catch (e) {
    logger.info(`Waiting for ${config.name} container to start`)
    await config.waitFor()
    return
  }

  logger.info(`Creating ${config.name} container`)
  await config.container.start()
  await NetworkUtils.connectContainer(networkId, config.container.containerName())
  await config.container.waitFor()
  logger.info(`Created ${config.name} container`)
}

async function initUnknownContainer(testContainer: TestContainer): Promise<void> {
  throw new Error(`Unknown container: ${testContainer}`)
}

async function getContainerNameOrUndefined(name: string): Promise<string> {
  try {
    return await DockerUtility.findTestContainerHostname(name)
  } catch (e) {
    return undefined
  }
}

async function getRandomPort(): Promise<string> {
  return String(await getPort())
}
