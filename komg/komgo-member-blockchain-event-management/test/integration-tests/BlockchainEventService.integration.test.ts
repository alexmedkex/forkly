import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import 'reflect-metadata'
import validator from 'validator'
import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'

import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import BlockchainEventService from '../../src/service-layer/BlockchainEventService'
import { EventObject } from '../../src/service-layer/EventObject'
import IService from '../../src/service-layer/IService'
import TestContract from '../contracts/TestContract4.json'
import LightContractLibraryMock from '../LightContractLibraryMock'

import { getContract, deploySmartContract, getEventObjectFromReceipt, ACCOUNT_PASSWORD } from './utils/blockchain-utils'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { sleep, verifyReceivedMessageInDummyMicroservice } from './utils/utils'

jest.setTimeout(150000)

const TEST_CONTRACT_EVENT_NAME = 'EventEmitted'
const CONTRACT_CREATED = 'ContractCreated'

/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers
 */
describe('BlockchainEventService Integration', () => {
  let iEnv: IntegrationEnvironment
  let service: IService
  let consumerMicroservice: ConsumerMicroservice
  let web3: Web3
  let account: string

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    web3 = await iEnv.beforeAll()
    account = await web3.eth.personal.newAccount(ACCOUNT_PASSWORD)

    consumerMicroservice = new ConsumerMicroservice(iEnv.mockedIds.publisherId)

    iocContainer.rebind<any>(VALUES.LightContractLibrary).toConstantValue(LightContractLibraryMock)
    iocContainer.rebind<IService>(TYPES.BlockchainEventService).to(BlockchainEventService)

    service = iocContainer.get<IService>(TYPES.BlockchainEventService)
  })

  beforeEach(async () => {
    await consumerMicroservice.beforeEach()
    await service.start()
  })

  /**
   * Given:
   * An event is emitted
   *
   * When:
   * Service is already running
   *
   * Then:
   * the message is consumed by the microservice
   */
  it('should publish an event successfully', async done => {
    const receipt = await deployTestContract()

    const expectedContent = getEventObjectFromReceipt(receipt, CONTRACT_CREATED)
    await verifyReceivedMessageInDummyMicroservice(done, expectedContent, consumerMicroservice)
  })

  /**
   * Given:
   * 5 events are emitted in the same block
   *
   * When:
   * Service is running
   *
   * Then:
   * the messages are consumed by the microservice when the service starts from block 0
   */
  it('should publish 5 events successfully within a block', async done => {
    const numberOfEvents = 5

    await service.stop()

    const receiptCreation = await deployTestContract()
    const receiptEvents = await emitEvents(receiptCreation.contractAddress, numberOfEvents)

    let receivedCounter = 0
    consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
      received.ack()

      // First event is the contract creation, next ones are the events from emitEvents
      const expectedContent =
        receivedCounter === 0
          ? getEventObjectFromReceipt(receiptCreation, CONTRACT_CREATED)
          : getEventObjectFromReceipt(receiptEvents, TEST_CONTRACT_EVENT_NAME, receivedCounter - 1)

      expect(received.content).toEqual(expectedContent)
      checkOptions(received.options.messageId, received.options.requestId)

      receivedCounter++
      if (receivedCounter === numberOfEvents + 1) {
        done()
      }
    })

    await service.start()
  })

  /**
   * Given:
   * A transaction without events
   *
   * When:
   * Service is running
   *
   * Then:
   * the service should process empty transactions and blocks
   * AMQP messages in Internal-MQ should have different requests Ids
   */
  it('should publish events successfully even if a transaction is empty', async done => {
    await service.stop()

    const receiptCreation = await deployTestContract()
    await sendTransactionWithoutEvents(receiptCreation.contractAddress)
    const receiptEvents = await emitEvents(receiptCreation.contractAddress, 1)

    let receivedCounter = 0
    let requestId1: string
    let requestId2: string
    consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
      received.ack()

      // First event is the contract creation, next one is an empty transaction and last one is a normal event
      const expectedContent =
        receivedCounter === 0
          ? getEventObjectFromReceipt(receiptCreation, CONTRACT_CREATED)
          : getEventObjectFromReceipt(receiptEvents, TEST_CONTRACT_EVENT_NAME)

      expect(received.content).toEqual(expectedContent)
      checkOptions(received.options.messageId, received.options.requestId)

      receivedCounter++
      if (receivedCounter === 1) {
        requestId1 = received.options.requestId
      } else if (receivedCounter === 2) {
        requestId2 = received.options.requestId

        // validate requestIds are different
        expect(requestId2).not.toBe(requestId1)
        done()
      }
    })

    await service.start()
  })

  /**
   * Given:
   * A failure of the service and a restart
   *
   * When:
   * Service is running and processing events
   *
   * Then:
   * the service should process blocks from the last stored block number
   */
  it('should publish events successfully if the service is restarted', async done => {
    await service.stop()

    const receiptCreation = await deployTestContract()
    const contractAddress = receiptCreation.contractAddress
    const receiptBeforeCrash = await emitEvents(contractAddress, 1)

    let receivedCounter = 0
    consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
      received.ack()

      receivedCounter++

      let expectedContent: EventObject
      if (receivedCounter === 1) {
        expectedContent = getEventObjectFromReceipt(receiptCreation, CONTRACT_CREATED)
      } else if (receivedCounter === 2) {
        expectedContent = getEventObjectFromReceipt(receiptBeforeCrash, TEST_CONTRACT_EVENT_NAME)
      } else if (receivedCounter === 3) {
        expectedContent = getEventObjectFromReceipt(receiptAfterCrash, TEST_CONTRACT_EVENT_NAME)
      }

      expect(received.content).toEqual(expectedContent)
      checkOptions(received.options.messageId, received.options.requestId)

      if (receivedCounter === 3) {
        done()
      }
    })

    await service.start()

    await sleep(2000) // give time to process events

    await service.stop()
    const receiptAfterCrash = await emitEvents(contractAddress, 1)
    await service.start()
  })

  /**
   * Given:
   * A failure of the blockchain node
   *
   * When:
   * Service is running
   *
   * Then:
   * the service should retry and process events when the blockchain is restarted
   */
  it('should publish events successfully if the blockchain crashes and is restarted', async done => {
    await iEnv.pauseQuorumFor(1000)
    await iEnv.waitForProxiedQuorumAvailability()
    account = await web3.eth.personal.newAccount(ACCOUNT_PASSWORD)

    const receipt = await deployTestContract()

    const expectedContent = getEventObjectFromReceipt(receipt, CONTRACT_CREATED)
    await verifyReceivedMessageInDummyMicroservice(done, expectedContent, consumerMicroservice)
  })

  afterEach(async () => {
    await sleep(1000) // Give time for events to be processed

    await service.stop()
    await consumerMicroservice.afterEach()
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  function deployTestContract() {
    const TestContractABI = TestContract.abi

    const contract = getContract(TestContractABI, account, web3)
    const bytecode = TestContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account)
  }

  async function emitEvents(contractAddress: string, numberOfEvents: number) {
    const contract = await getContract(TestContract.abi, account, web3, contractAddress)
    return new Promise<TransactionReceipt>((resolve, reject) => {
      contract.methods
        .emitEvents(numberOfEvents)
        .send()
        .once('receipt', receipt => resolve(receipt))
        .once('error', error => reject(error))
    })
  }

  async function sendTransactionWithoutEvents(contractAddress: string) {
    const contract = await getContract(TestContract.abi, account, web3, contractAddress)
    const randomValue = Math.floor(Math.random() * 10 + 1)

    return new Promise<TransactionReceipt>((resolve, reject) => {
      contract.methods
        .setStorage(randomValue)
        .send()
        .once('receipt', receipt => resolve(receipt))
        .once('error', error => reject(error))
    })
  }

  function checkOptions(messageId: string, requestId: string) {
    expect(messageId).toBeDefined()
    expect(requestId).toBeDefined()
    expect(validator.isUUID(messageId, 4)).toBeTruthy()
  }
})
