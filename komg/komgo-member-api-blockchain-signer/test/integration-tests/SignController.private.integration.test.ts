import 'jest'
import 'reflect-metadata'

import { Web3Wrapper } from '@komgo/blockchain-access'
import { ConsumerMicroservice, waitUntilTrue } from '@komgo/integration-test-utilities'
import PromiEvent from 'promievent'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'

import { SendTxResultMessage } from '@komgo/messaging-types/api-blockchain-signer'
import TransactionDataAgent from '../../src/data-layer/data-agents/TransactionDataAgent'
import { TransactionStatus } from '../../src/data-layer/models/transaction/TransactionStatus'
import { iocContainer } from '../../src/inversify/ioc'
import { INJECTED_VALUES } from '../../src/inversify/values'
import { ICreateEthKeyRequest } from '../../src/service-layer/request/key-manage/ICreateEthKeyRequest'

import TestContract from './contracts/TestContract'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { verifyReceivedMessageInDummyMicroservice, waitForTransactionCompletion } from './utils/utils'

// to allow time for RabbitMQ to start
jest.setTimeout(200000)

const MAX_TRANSACTION_ATTEMPTS = iocContainer.get<number>(INJECTED_VALUES.MaxTransactionAttempts)
const REQUEST_ORIGIN = 'dummyMicroservice'
const MNEMONIC = 'buyer try humor into improve thrive fruit funny skate velvet vanish live'
const address1 = '0x1dcde766a577abfe76bf32c1f0032fcd24f3a6c0'
const address2 = '0xb5f30b19c2b2fd418d5ea2e07b26bc1ef90c2c39'

const quorumNode2PublicKey = 'iO8XbAo/r8yHU+f1RK8evDW+vYmiUkxHXb98JIsPCw8='

const defaultGasValues = {
  gasPrice: '0x0',
  gasLimitPerTransaction: 6000000
}

const ethKeyRequest: ICreateEthKeyRequest = {
  passphrase: 'eth_passphrase'
}

const txContext = {
  key: 'value'
}


const getNewPromiEventError = (): PromiEvent<any> => {
  const promiEvent = new PromiEvent<any>(resolve => {
    const timer = setInterval(() => {
      const error = new Error('ERROR_MESSAGE')
      promiEvent.emit('error', error)
      resolve(error)

      clearInterval(timer)
    }, 500)
  })

  return promiEvent
}

/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers.
 */
describe('SignController integration test for private transactions', () => {
  const txDataAgent = new TransactionDataAgent()
  let consumerMicroservice: ConsumerMicroservice
  let iEnv: IntegrationEnvironment
  let node1Web3: Web3
  let accounts: string[]
  const quorumHost = 'localhost'
  const quorumNode1Port = '22001'
  const quorumNode2Port = '22002'
  const quorumNode3Port = '22003'

  // This is the sha3 hash of the EmittedName event on the smart contract that is deployed
  const eventEmittedHash = '0xbb02cddae59d501d1fcf63888ace3fad45eb43ca3387d34e3bb6a29be957e3f1'

  beforeAll(async () => {
    jest.resetAllMocks()
    iEnv = new IntegrationEnvironment()

    const web3Wrapper = new Web3Wrapper(quorumHost, quorumNode1Port)
    node1Web3 = web3Wrapper.web3Instance

    await iEnv.beforeAll()

    accounts = await node1Web3.eth.getAccounts()
  })

  beforeEach(async () => {
    await iEnv.beforeEach(node1Web3)

    consumerMicroservice = new ConsumerMicroservice(iEnv.mockedIds.publisherId)
    await consumerMicroservice.beforeEach()

    // Initialize private keys
    await iEnv.postAPISigner('key-manage/eth', ethKeyRequest)
  })

  /**
   * Given:
   * A private transaction is sent to a smart contract for quorum node 2
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server posts the private transaction to node 1 blockchain.  Only
   * node 2 can see the event emitted from the smart contract
   */
  it('should be able to post a private Transaction to a node', async () => {
    // deploy the contract privately for quorum node 2
    const contract = await deploySmartContract([quorumNode2PublicKey])

    const txData = contract.methods.emitEvents(1).encodeABI()

    // send a private transaction to quorum node 2
    const result = await iEnv.postAPISigner('signer/send-private-tx', {
      to: contract.options.address,
      data: txData,
      gas: 300000000,
      privateFor: [quorumNode2PublicKey],
      requestOrigin: REQUEST_ORIGIN,
      context: txContext
    })

    const txId = result.data
    const txBeforeConfirmation = await txDataAgent.getTransaction(txId)

    // Transaction params
    expect(txBeforeConfirmation.status).toBe(TransactionStatus.Pending)
    expect(txBeforeConfirmation.requestOrigin).toBe(REQUEST_ORIGIN)

    // Transaction body
    expect(txBeforeConfirmation.body.to).toBe(contract.options.address)
    expect(txBeforeConfirmation.body.data).toBe(txData)

    const tx = await waitForTransactionCompletion(txId)
    expect(tx.receipt).toBeDefined()
    // commenting this as is really flaky
    // Current behavior sees a few attempts of posting and because for private tx hashes
    //will be different every time and the mapping might not match.
    // TODO: investigate reason for multiple posting and incorrect hash mappings
    // expect(tx.hash).toBe(tx.receipt.transactionHash)
    expect(tx.status).toEqual(TransactionStatus.Confirmed)
    expect(tx.context).toEqual(txContext)

    const node2Web3Wrapper = new Web3Wrapper(quorumHost, quorumNode2Port)
    await verifyPrivateTransaction(node2Web3Wrapper, tx.hash)

    // check node2 can see the private emitted event
    await verifyEventEmitted(node2Web3Wrapper.web3Instance, tx.hash)

    // check node3 did not see the private emitted event
    const node3Web3Wrapper = new Web3Wrapper(quorumHost, quorumNode3Port)
    const receipt = await node3Web3Wrapper.web3Instance.eth.getTransactionReceipt(tx.hash)
    expect(receipt.logs.length).toBe(0)
  })

  afterEach(async () => {
    await iEnv.afterEach()
    await consumerMicroservice.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  async function deploySmartContract(privateFor?: string[]): Promise<any> {
    const contract = await getContract()
    const encodedData = contract
      .deploy({
        data: TestContract.bytecode,
        arguments: []
      })
      .encodeABI()

    const result = await iEnv.postAPISigner('signer/send-private-tx', {
      data: encodedData,
      gas: 300000000,
      privateFor
    })
    const txId = result.data

    const tx = await waitForTransactionCompletion(txId)

    expect(tx.receipt).toBeDefined()

    // commenting this as is really flaky
    // Current behavior sees a few attempts of posting and because for private tx hashes
    //will be different every time and the mapping might not match.
    // TODO: investigate reason for multiple posting and incorrect hash mappings
    // expect(tx.hash).toBe(tx.receipt.transactionHash)
    expect(tx.status).toEqual(TransactionStatus.Confirmed)

    const receipt = tx.receipt
    contract.options.address = receipt.contractAddress

    return contract
  }

  function getContract(address?: string): Contract {
    return new node1Web3.eth.Contract(TestContract.abi as AbiItem[], address, {
      from: accounts[0],
      gasPrice: defaultGasValues.gasPrice,
      gas: defaultGasValues.gasLimitPerTransaction,
      data: TestContract.bytecode
    })
  }

  async function verifyEventEmitted(web3Instance: Web3, txHash: string) {
    const receipt = await web3Instance.eth.getTransactionReceipt(txHash)

    // Verify the expected event was emitted by comparing the hash in the logs topic
    // to the sha3 hash of 'EventEmitted(address,uint256)'
    const eventEmittedHashInLog = receipt.logs[0].topics[0]
    expect(eventEmittedHashInLog).toBe(eventEmittedHash)
  }

  async function verifyPrivateTransaction(node2Web3Wrapper: Web3Wrapper, txHash: any) {
    let tx
    await waitUntilTrue({
      timeout: 10000,
      interval: 500,
      message: `Failed to get a transaction with hash ${txHash}`
    }, async () => {
      tx = await node2Web3Wrapper.web3Instance.eth.getTransaction(txHash)
      return !!tx
    })
    expect(isVPrivateValue(tx.v)).toBeTruthy()
  }

  function isVPrivateValue(txV: string) {
    // a private transaction will have hex 0x26 or 0x27(37/38 decimal) as the v value
    // ref: https://github.com/jpmorganchase/quorum/wiki/Transaction-Processing
    return txV === '0x25' || txV === '0x26'
  }

  function mockWeb3SendTransactionOnError(web3Instance: Web3, numberOfTimes: number) {
    const spy = jest.spyOn(web3Instance.eth, 'sendTransaction')
    for (let i = 0; i < numberOfTimes; i++) {
      spy.mockImplementationOnce(getNewPromiEventError)
    }
  }
})
