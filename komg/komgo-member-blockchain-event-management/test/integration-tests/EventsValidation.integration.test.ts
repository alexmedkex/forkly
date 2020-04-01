import { ConsumerMicroservice, IExpectedMessage } from '@komgo/integration-test-utilities'
import 'reflect-metadata'
import validator from 'validator'
import Web3 from 'web3'
import { TransactionReceipt, Log } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { ContractAddressDataAgent, EventProcessedDataAgent } from '../../src/data-layer/data-agents'
import { ContractAddressStatus } from '../../src/data-layer/models/contract-address'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import BlockchainEventService from '../../src/service-layer/BlockchainEventService'
import { EventObject } from '../../src/service-layer/EventObject'
import IService from '../../src/service-layer/IService'
import DeactivatedContract from '../contracts/TestContract.json'
import InexistentContract from '../contracts/TestContract2.json'
import ParamsContract from '../contracts/TestContract3.json'
import ActivatedContract from '../contracts/TestContract4.json'
import ContractCastContract from '../contracts/TestContract5.json'
import LightContractLibraryMock from '../LightContractLibraryMock'

import {
  getEventObjectFromLog,
  getEventObjectFromReceipt,
  ACCOUNT_PASSWORD,
  deploySmartContract,
  getContract
} from './utils/blockchain-utils'
import IntegrationEnvironment, { QUORUM_HOST, QUORUM_PORT, members } from './utils/IntegrationEnvironment'
import Member from './utils/Member'
import { sleep, verifyReceivedMessageInDummyMicroservice } from './utils/utils'

jest.setTimeout(150000)

const TEST_CONTRACT_EVENT_NAME = 'EventEmitted'
const CAST_EVENT_NAME = 'CastEvent'
const CONTRACT_CREATED = 'ContractCreated'

/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers
 */
describe('EventsValidation Integration', () => {
  let iEnv: IntegrationEnvironment
  let service: IService
  let consumerMicroservice: ConsumerMicroservice
  let web3: Web3
  let account: string
  let contractAddressDataAgent: ContractAddressDataAgent
  let eventProcessedDataAgent: EventProcessedDataAgent

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    web3 = await iEnv.beforeAll()
    account = await web3.eth.personal.newAccount(ACCOUNT_PASSWORD)

    consumerMicroservice = new ConsumerMicroservice(iEnv.mockedIds.publisherId)

    // Use the mocked light contract library for the tests
    iocContainer.rebind<any>(VALUES.LightContractLibrary).toConstantValue(LightContractLibraryMock)
    iocContainer.rebind<IService>(TYPES.BlockchainEventService).to(BlockchainEventService)

    contractAddressDataAgent = iocContainer.get<ContractAddressDataAgent>(TYPES.ContractAddressDataAgent)
    eventProcessedDataAgent = iocContainer.get<EventProcessedDataAgent>(TYPES.EventProcessedDataAgent)
    service = iocContainer.get<IService>(TYPES.BlockchainEventService)
  })

  beforeEach(async () => {
    await consumerMicroservice.beforeEach()
  })

  describe('Whitelisted contracts', () => {
    /**
     * Given:
     * Multiple events are emitted
     *
     * When:
     * Service is already running and the contract is whitelisted
     *
     * Then:
     * the contract and the events are valid and the messages are consumed by the microservice in order.
     * The message format is valid
     * Messages are received in order
     */
    it('should validate and publish all events from a whitelisted contract, even if the contract is currently deactivated', async done => {
      const nbEvents = 5

      const receiptCreation = await deployDeactivatedContract()
      const contractAddress = receiptCreation.contractAddress

      // emit events
      const receiptEvents = await emitEventsDeactivatedContract(contractAddress, nbEvents)

      // whitelist contract
      await contractAddressDataAgent.whitelist(contractAddress, receiptCreation.transactionHash)

      let receivedCounter = 0
      consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
        received.ack()

        const expectedContent =
          receivedCounter === 0
            ? getEventObjectFromReceipt(receiptCreation, CONTRACT_CREATED)
            : getEventObjectFromReceipt(receiptEvents, TEST_CONTRACT_EVENT_NAME, receivedCounter - 1)

        // message received, verify that the values where copied fine, based on the mocked values
        expect(received.content).toEqual(expectedContent)
        expect(received.options.messageId).toBeDefined()
        expect(received.options.requestId).toBeDefined()
        expect(validator.isUUID(received.options.messageId, 4)).toBeTruthy()

        receivedCounter++
        // Test stops when we have received nbEvents + 1 events (+1 because of the contract creation event)
        if (receivedCounter === nbEvents + 1) {
          done()
        }
      })

      // Start service
      await service.start()
    })

    /**
     * Given:
     * A contract cast event is emitted
     *
     * When:
     * Service is already running and the contract is already whitelisted
     *
     * Then:
     * the event is published successfully
     */
    it('should publish a contract cast event emitted in a function successfully', async done => {
      const contractCastAddress = '0x1a5c29c94D03C4c8f7414564CBD57295d61e898f'
      const contractCastName = 'ContractName'

      // Deploy contract and whitelist deployed contract and contract cast address
      const receiptCreation = await deployContractCastContract(contractCastName, contractCastAddress)
      const contractAddress = receiptCreation.contractAddress
      await contractAddressDataAgent.whitelist(contractAddress, receiptCreation.transactionHash)
      await contractAddressDataAgent.whitelist(contractCastAddress)

      // emit events
      const receiptEvents = await emitContractCastEvents(contractAddress, contractCastName, contractCastAddress, 1)

      const contractCastEventContent = getEventObjectFromReceipt(receiptEvents, CAST_EVENT_NAME)

      let receivedCounter = 0
      consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
        received.ack()

        receivedCounter++

        // The third event is the contractCast event emitted from a function (not the constructor)
        if (receivedCounter === 3) {
          // message received, verify that the values where copied fine, based on the mocked values
          expect(received.content).toEqual(contractCastEventContent)
          expect(received.options.messageId).toBeDefined()
          expect(received.options.requestId).toBeDefined()
          expect(validator.isUUID(received.options.messageId, 4)).toBeTruthy()

          done()
        }
      })

      // Start service
      await service.start()
    })

    /**
     * Given:
     * A contract cast event is emitted from a function
     *
     * When:
     * Service is already running and the contract is already whitelisted
     *
     * Then:
     * the contract is blacklisted upon emission of invalid contract cast event
     */
    it('should blacklist a contract if an invalid contract cast event is emitted from a function', async () => {
      const contractCastAddress = '0x1a5c29c94D03C4c8f7414564CBD57295d61e898f'
      const contractCastName = 'ContractName'

      // Deploy contract and whitelist deployed contract and contract cast address
      const receiptCreation = await deployContractCastContract(contractCastName, contractCastAddress)
      const contractAddress = receiptCreation.contractAddress
      await contractAddressDataAgent.whitelist(contractAddress, receiptCreation.transactionHash)
      await contractAddressDataAgent.whitelist(contractCastAddress)

      // Start service
      await service.start()

      // Emit contract cast event
      const invalidContractCastAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'
      await emitContractCastEvents(contractAddress, 'InvalidContract', invalidContractCastAddress, 1)

      // Wait for the contract to be blacklisted
      await sleep(4000)

      const status = await contractAddressDataAgent.getStatus(contractAddress)
      expect(status).toEqual(ContractAddressStatus.Blacklisted)
    })
  })

  describe('Blacklisted contracts', () => {
    /**
     * Given:
     * Multiple events are emitted
     *
     * When:
     * Service is already running
     *
     * Then:
     * the contract is blacklisted and the service does not publish events from it
     */
    it('should not process events from a blacklisted contract', async done => {
      const receiptContract = await deployActivatedContract()
      await contractAddressDataAgent.whitelist(receiptContract.contractAddress, receiptContract.transactionHash)

      const receiptDeactivated = await deployDeactivatedContract()
      await contractAddressDataAgent.blacklist(receiptDeactivated.contractAddress, receiptDeactivated.transactionHash)

      // emit event from blacklisted contract first, then an event from the whitelisted contract
      await emitEventsDeactivatedContract(receiptDeactivated.contractAddress, 1)
      await emitEventsActivatedContract(receiptContract.contractAddress, 1)

      let receivedCounter = 0
      consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
        received.ack()

        // We should only receive events from the valid smart contract
        const content = received.content as EventObject
        expect(content.contractAddress).not.toEqual(receiptDeactivated.contractAddress)

        receivedCounter++
        if (receivedCounter === 2) {
          done()
        }
      })

      // Start service
      await service.start()
    })
  })

  describe('Unknown contracts', () => {
    beforeEach(() => {
      service.start()
    })
    /**
     * Given:
     * An event is emitted
     *
     * When:
     * Service is already running and the contract is unknown
     *
     * Then:
     * the contract and the event are valid and the message is consumed by the microservice
     */
    it('should whitelist and publish a creation event from an unknown and valid contract successfully', async done => {
      const receipt = await deployActivatedContract()

      const contractCreatedEventContent = getEventObjectFromReceipt(receipt, CONTRACT_CREATED)
      await verifyReceivedMessageInDummyMicroservice(done, contractCreatedEventContent, consumerMicroservice)
    })

    /**
     * Given:
     * An event is emitted from contract *with constructor parameters*
     *
     * When:
     * Service is already running and the contract is unknown
     *
     * Then:
     * the contract and the event are valid and the message is consumed by the microservice
     */
    it('should whitelist and publish a creation event from an unknown and valid contract, that takes constructor params, successfully', async done => {
      const receipt = await deployParamsContract('hello', 'world')

      const contractCreatedEventContent = getEventObjectFromReceipt(receipt, CONTRACT_CREATED)
      await verifyReceivedMessageInDummyMicroservice(done, contractCreatedEventContent, consumerMicroservice)
    })

    /**
     * Given:
     * An event is emitted
     *
     * When:
     * Service is already running and the contract is unknown
     *
     * Then:
     * the contract and the event are Deactivated because the contract is deprecated
     */
    it('should blacklist an unknown and deactivated contract successfully', async () => {
      const receipt = await deployDeactivatedContract()
      const contractAddress = receipt.contractAddress

      // Wait for event to be processed
      await sleep(2000)
      const status = await contractAddressDataAgent.getStatus(contractAddress)

      expect(status).toBe(ContractAddressStatus.Blacklisted)
      await expectEventToHaveBeenProcessed(receipt)
    })

    /**
     * Given:
     * An event is emitted
     *
     * When:
     * Service is already running and the contract is unknown
     *
     * Then:
     * the contract and the event are inexistent (not in contract library)
     */
    it('should blacklist an unknown and inexistent contract successfully', async () => {
      const receipt = await deployInexistentContract()
      const contractAddress = receipt.contractAddress

      // Wait for event to be processed
      await sleep(2000)
      const status = await contractAddressDataAgent.getStatus(contractAddress)

      expect(status).toBe(ContractAddressStatus.Blacklisted)
      await expectEventToHaveBeenProcessed(receipt)
    })

    /**
     * Given:
     * Two events are emitted, a contract cast event followed by a contract creation event
     *
     * When:
     * Service is already running and the contract is unknown
     *
     * Then:
     * the contract and the events are valid and the contract creation and cast message are consumed by the microservice
     */
    it('should validate a contract emitting a valid cast event followed by a valid contract creation event.', async done => {
      const whitelistedContractAddress = '0x1a5c29c94D03C4c8f7414564CBD57295d61e898f'
      await contractAddressDataAgent.whitelist(whitelistedContractAddress)

      const receipt = await deployContractCastContract('ContractName', whitelistedContractAddress)

      let receivedCounter = 0
      consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
        received.ack()

        // We should only receive events from the valid smart contract
        const content = received.content as EventObject
        if (receivedCounter === 0) {
          const contractCastEvent = getEventObjectFromReceipt(receipt, CAST_EVENT_NAME)
          expect(content).toEqual(contractCastEvent)
        }

        if (receivedCounter === 1) {
          const contractCreationEvent = getEventObjectFromReceipt(receipt, CONTRACT_CREATED)
          expect(content).toEqual(contractCreationEvent)
          done()
        }

        receivedCounter++
      })
    })

    /**
     * Given:
     * A contract cast event is emitted
     *
     * When:
     * Service is already running and the contract is unknown
     *
     * Then:
     * the contract cast event is invalid and the contract gets blacklisted (address is not found in DB)
     */
    it('should blacklist a contract emitting an invalid cast event', async () => {
      const inexistentContractCastAddress = '0x1a5c29c94D03C4c8f7414564CBD57295d61e898f'

      const receipt = await deployContractCastContract('ContractName', inexistentContractCastAddress)
      const contractAddress = receipt.contractAddress

      // Wait for event to be processed
      await sleep(2000)
      const status = await contractAddressDataAgent.getStatus(contractAddress)

      expect(status).toBe(ContractAddressStatus.Blacklisted)
      await expectEventToHaveBeenProcessed(receipt)
    })
  })

  describe('Private contracts', () => {
    beforeEach(() => {
      service.start()
    })
    /**
     * Given:
     * A valid private smart contract is created by member 1, private for member 3
     *
     * When:
     * Service is started by member 1
     *
     * Then:
     * The contract address is whitelisted by member 1
     * The event is forwarded to internal-MQ
     *
     * By default, service web3 is run with member 1
     */
    it('should whitelist and publish a creation event from a private smart contract as sender', async done => {
      const member3 = members[2]
      const privateFor = [member3.pub]
      const receipt = await deployPrivateActivatedContract(privateFor)

      // Ensure this is a private contract creation
      const tx = await web3.eth.getTransaction(receipt.transactionHash)
      assertIsPrivateTransaction(tx)

      // Expect message to be published
      consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
        received.ack()

        // We should only receive events from the valid smart contract
        const content = received.content as EventObject
        expect(content.contractAddress).toEqual(receipt.contractAddress)

        // Wait and then Expect contract address to be whitelisted
        const status = await contractAddressDataAgent.getStatus(receipt.contractAddress)
        expect(status).toBe(ContractAddressStatus.Whitelisted)

        done()
      })
    })
    /**
     * Given:
     * A valid private smart contract is created by member 3, private for member 1
     *
     * When:
     * Service is started by member 1
     *
     * Then:
     * The contract address is whitelisted by member 1
     * The event is forwarded to internal-MQ
     *
     * By default, service web3 is run with member 1
     */
    it('should whitelist and publish a creation event from a private smart contract as recipient', async done => {
      const member3 = members[2]
      const member1 = members[0]
      const privateFor = [member1.pub]
      const receipt = await deployPrivateActivatedContractFromMember(privateFor, member3)

      // Ensure this is a private contract creation
      const tx = await member1.web3.eth.getTransaction(receipt.transactionHash)
      assertIsPrivateTransaction(tx)

      // Expect message to be published
      consumerMicroservice.messagingConsumer.listen(iEnv.mockedIds.publisherId, 'BLK.#', async received => {
        received.ack()

        // We should only receive events from the valid smart contract
        const content = received.content as EventObject
        expect(content.contractAddress).toEqual(receipt.contractAddress)

        // Wait and then Expect contract address to be whitelisted
        const status = await contractAddressDataAgent.getStatus(receipt.contractAddress)
        expect(status).toBe(ContractAddressStatus.Whitelisted)

        done()
      })
    })

    /**
     * Given:
     * A valid private smart contract is created by member 2, private for member 4
     *
     * When:
     * Service is started by member 1
     *
     * Then:
     * The contract address is NOT whitelisted by member 1
     * Event is unseen in transaction, so blockchain event service skips transaction
     *
     * By default, service web3 is run with member 1
     */
    it('should not find event inside transaction if member not in privateFor', async () => {
      const [member1, member2, _, member4] = members
      const privateFor = [member4.pub]
      const receipt = await deployPrivateActivatedContractFromMember(privateFor, member2)

      await sleep(5000)
      const member1Receipt = await member1.web3.eth.getTransactionReceipt(receipt.transactionHash)
      const status = await contractAddressDataAgent.getStatus(receipt.contractAddress)

      expect(member1Receipt.logs.length).toBeLessThan(receipt.logs.length)
      expect(member1Receipt.logs).toEqual([])
      expect(status).toBe(null)
    })
  })

  afterEach(async () => {
    await service.stop()
    await consumerMicroservice.afterEach()
    await iEnv.afterEach()
    await iEnv.cleanAutoWhitelist()
    await iEnv.cleanContractAddress()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  function assertIsPrivateTransaction(tx) {
    if (!['0x25', '0x26'].includes(tx.v)) {
      throw new Error(`This is not a private transaction as v=${tx.v}`)
    }
  }

  async function deployPrivateActivatedContract(privateFor: string[]) {
    const rawTx = buildActivatedContractCreationTransaction()
    return sendRawTransaction({ ...rawTx, privateFor })
  }

  async function deployPrivateActivatedContractFromMember(privateFor: string[], member: Member) {
    const password = 'password'
    const acct = await member.newAccount(password)

    const rawTx = buildActivatedContractCreationTransaction(acct)
    return sendRawTransaction({ ...rawTx, privateFor }, member.web3, acct, password)
  }

  function buildActivatedContractCreationTransaction(from?: string) {
    const contract = getContract(ActivatedContract.abi, from, web3)
    return buildRawTx(contract, ActivatedContract.bytecode, [], from)
  }

  function buildRawTx(contract: Contract, bytecode: string, args: any[], from: string = account) {
    const data = contract
      .deploy({
        data: bytecode,
        arguments: args
      })
      .encodeABI()
    return {
      from,
      data,
      gas: 300000000
    }
  }

  async function sendRawTransaction(
    rawTx: any,
    web3Inst: Web3 = web3,
    sender: string = account,
    password: string = ACCOUNT_PASSWORD,
    duration: number = 2000
  ): Promise<TransactionReceipt> {
    await web3Inst.eth.personal.unlockAccount(sender, password, duration)
    return new Promise((resolve, reject) => {
      web3Inst.eth
        .sendTransaction(rawTx)
        .once('receipt', resolve)
        .once('error', reject)
    })
  }

  async function expectEventToHaveBeenProcessed({ blockNumber, transactionHash }: TransactionReceipt) {
    const lastEventProcessed = await eventProcessedDataAgent.getLastEventProcessed()
    expect(blockNumber).toBeLessThanOrEqual(lastEventProcessed.blockNumber)
    if (blockNumber === lastEventProcessed.blockNumber) {
      expect(lastEventProcessed).toEqual(
        expect.objectContaining({
          blockNumber,
          transactionHash
        })
      )
    }
  }

  function deployActivatedContract() {
    const ActivatedContractABI = ActivatedContract.abi

    const contract = getContract(ActivatedContractABI, account, web3)
    const bytecode = ActivatedContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account)
  }

  function deployDeactivatedContract() {
    const DeactivatedContractABI = DeactivatedContract.abi

    const contract = getContract(DeactivatedContractABI, account, web3)
    const bytecode = DeactivatedContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account)
  }

  function deployInexistentContract() {
    const InexistentContractABI = InexistentContract.abi

    const contract = getContract(InexistentContractABI, account, web3)
    const bytecode = InexistentContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account)
  }

  function deployParamsContract(inputParam1: string, inputParam2: string) {
    const ParamsContractABI = ParamsContract.abi

    const contract = getContract(ParamsContractABI, account, web3)
    const bytecode = ParamsContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account, [inputParam1, inputParam2])
  }

  function deployContractCastContract(contractCastName: string, contractCastAddress: string) {
    const ContractCastContractABI = ContractCastContract.abi

    const contract = getContract(ContractCastContractABI, account, web3)
    const bytecode = ContractCastContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account, [contractCastName, contractCastAddress])
  }

  function emitEventsDeactivatedContract(contractAddress: string, numberOfEvents: number) {
    return emitEvents(DeactivatedContract.abi, contractAddress, numberOfEvents)
  }

  function emitEventsActivatedContract(contractAddress: string, numberOfEvents: number) {
    return emitEvents(ActivatedContract.abi, contractAddress, numberOfEvents)
  }

  async function emitEvents(abi: object[], contractAddress: string, numberOfEvents: number) {
    const contract = await getContract(abi, account, web3, contractAddress)
    return new Promise<TransactionReceipt>((resolve, reject) => {
      contract.methods
        .emitEvents(numberOfEvents)
        .send()
        .once('receipt', receipt => resolve(receipt))
        .once('error', error => reject(error))
    })
  }

  async function emitContractCastEvents(
    contractAddress: string,
    contractCastName: string,
    contractCastAddress: string,
    numberOfEvents: number
  ) {
    const contract = await getContract(ContractCastContract.abi, account, web3, contractAddress)
    return new Promise<TransactionReceipt>((resolve, reject) => {
      contract.methods
        .emitContractCastEvents(contractCastName, contractCastAddress, numberOfEvents)
        .send()
        .once('receipt', receipt => resolve(receipt))
        .once('error', error => reject(error))
    })
  }
})
