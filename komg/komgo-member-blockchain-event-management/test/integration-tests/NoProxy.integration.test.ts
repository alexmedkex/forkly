import { Web3Wrapper } from '@komgo/blockchain-access'
import DataAccess from '@komgo/data-access'
import {
  ConsumerMicroservice,
  AMQPConfig,
  QuorumContainer,
  RabbitMQContainer,
  MongoContainer
} from '@komgo/integration-test-utilities'
import { LogLevel, configureLogging } from '@komgo/logging'
import { MessagingFactory, IRequestIdHandler } from '@komgo/messaging-library'
import config from 'config'
import 'reflect-metadata'
import Web3 from 'web3'

process.env.LOG_LEVEL = LogLevel.Info

import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import BlockchainEventService from '../../src/service-layer/BlockchainEventService'
import IService from '../../src/service-layer/IService'
import TestContract from '../contracts/TestContract4.json'
import LightContractLibraryMock from '../LightContractLibraryMock'

import { getContract, deploySmartContract, ACCOUNT_PASSWORD, getEventObjectFromReceipt } from './utils/blockchain-utils'
import { QUORUM_PORT, QUORUM_HOST } from './utils/IntegrationEnvironment'
import { IMockedIds } from './utils/types'
import { sleep, verifyReceivedMessageInDummyMicroservice, createMockedIds, deleteInternalMQs } from './utils/utils'

jest.setTimeout(150000)

/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers
 */
describe('Integration tests without a HTTP proxy', () => {
  let service: IService
  let consumerMicroservice: ConsumerMicroservice
  let web3: Web3
  let account: string

  const quorumContainer = new QuorumContainer()
  const mongoContainer = new MongoContainer()
  const amqpConfig = new AMQPConfig()
  const rabbitContainer: RabbitMQContainer = new RabbitMQContainer(amqpConfig)
  const mockedIds: IMockedIds = createMockedIds()

  beforeAll(async () => {
    configureLogging('blk-event-mgnt-integration-test')

    await startMongo()
    await startRabbitMQ()
    await startQuorum()

    rebindMessageFactoryWithMockedIds(mockedIds, amqpConfig)
    web3 = rebindWeb3Instance(QUORUM_HOST, QUORUM_PORT)

    account = await web3.eth.personal.newAccount(ACCOUNT_PASSWORD)

    consumerMicroservice = new ConsumerMicroservice(mockedIds.publisherId)

    iocContainer.rebind<any>(VALUES.LightContractLibrary).toConstantValue(LightContractLibraryMock)
    iocContainer.rebind<IService>(TYPES.BlockchainEventService).to(BlockchainEventService)

    service = iocContainer.get<IService>(TYPES.BlockchainEventService)

    // connect to MongoDB
    DataAccess.setUrl(config.get('mongo.url').toString())
    DataAccess.setAutoReconnect(false)
    DataAccess.connect()
  })

  beforeEach(async () => {
    await consumerMicroservice.beforeEach()
    await service.start()
  })

  it('should publish an event successfully without a HTTP proxy', async done => {
    const receipt = await deployTestContract()
    const expectedContent = getEventObjectFromReceipt(receipt, 'ContractCreated')
    await verifyReceivedMessageInDummyMicroservice(done, expectedContent, consumerMicroservice)
  })

  afterEach(async () => {
    await sleep(1000) // Give time for events to be processed

    await service.stop()
    await consumerMicroservice.afterEach()
    await sleep(1000)
  })

  afterAll(async () => {
    await rabbitContainer.delete()
    await quorumContainer.delete()
    await mongoContainer.delete()
  })

  function deployTestContract() {
    const TestContractABI = TestContract.abi

    const contract = getContract(TestContractABI, account, web3)
    const bytecode = TestContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account)
  }

  async function startMongo() {
    await mongoContainer.start()
    await mongoContainer.waitFor()
    await sleep(2000)
  }

  async function startRabbitMQ() {
    await rabbitContainer.start()
    await rabbitContainer.waitFor()
  }

  async function startQuorum() {
    await quorumContainer.start()
    await quorumContainer.waitFor()
  }

  function rebindWeb3Instance(quorumHost: string, quorumPort: string): Web3 {
    const web3Wrapper = new Web3Wrapper(quorumHost, quorumPort)
    web3 = web3Wrapper.web3Instance
    iocContainer.rebind(TYPES.Web3Instance).toConstantValue(web3)
    return web3
  }
})

function rebindMessageFactoryWithMockedIds(mockedIds: IMockedIds, amqpConfig: AMQPConfig) {
  iocContainer.rebind(VALUES.PublisherId).toConstantValue(mockedIds.publisherId)
  iocContainer
    .rebind(TYPES.MessagingFactory)
    .toConstantValue(
      new MessagingFactory(
        amqpConfig.host,
        amqpConfig.username,
        amqpConfig.password,
        iocContainer.get<IRequestIdHandler>(VALUES.RequestIdHandler)
      )
    )
}
