import 'jest'
import 'reflect-metadata'

import { Web3Wrapper } from '@komgo/blockchain-access'
import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import logger from '@komgo/logging'
import { SendTxResultMessage } from '@komgo/messaging-types/api-blockchain-signer'
import * as bson from 'bson'
import PromiEvent from 'promievent'
import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'

import { IETHPublicData } from '../../src/business-layer/key-management/models/IETHKeyData'
import TransactionDataAgent from '../../src/data-layer/data-agents/TransactionDataAgent'
import { TransactionStatus } from '../../src/data-layer/models/transaction/TransactionStatus'
import { iocContainer } from '../../src/inversify/ioc'
import { INJECTED_VALUES } from '../../src/inversify/values'
import { ICreateEthKeyRequest } from '../../src/service-layer/request/key-manage/ICreateEthKeyRequest'
import {
  IEncryptRequest,
  IPayloadRequest,
  IVerifyETHRequest,
  PostRawTransactionRequest,
} from '../../src/service-layer/request/signer'
import TestContract from './contracts/TestContract'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { sleep, verifyReceivedMessageInDummyMicroservice, waitForTransactionCompletion } from './utils/utils'

const MAX_TRANSACTION_ATTEMPTS = iocContainer.get<number>(INJECTED_VALUES.MaxTransactionAttempts)
// to allow time for RabbitMQ to start
jest.setTimeout(200000)

const ethKeyRequest: ICreateEthKeyRequest = {
  passphrase: 'eth_passphrase'
}

const rawData: IPayloadRequest = {
  payload: 'raw message'
}

const externalPublicKey =
  '7e250e94f3913b04f45168fdcde2663211e9e79b2730c492206c59bdb4f57ab855c9e76d587623b9545d0a52a03c01ea751bfba7552b73c04df3b7c40a7a0e07'

const contractAddress = '0x36eFb40A6a5bA83461682066FD81fE85a01E5491'

const defaultGasValues = {
  gasPrice: '0x0',
  gasLimitPerTransaction: 6000000
}

const context = {
  key: 'value'
}

const rawTxRequest: PostRawTransactionRequest = {
  data: 'someData',
  to: contractAddress,
  value: '0x0',
  requestOrigin: 'dummyMicroservice',
  gas: defaultGasValues.gasLimitPerTransaction,
  context
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

describe('SignController retryInterval 0, simulate overlapping cycles', () => {
  let iEnv: IntegrationEnvironment
  let consumerMicroservice: ConsumerMicroservice
  let web3: Web3
  let accounts: string[]
  const ethPublicData: IETHPublicData = {
    address: '',
    publicKey: '',
    publicKeyCompressed: ''
  }
  let txDataAgent: TransactionDataAgent

  const quorumHost = 'localhost'
  const quorumNode1Port = '22001'

  beforeAll(async () => {
    // Make asyncpool run constantly
    //attempting to re-run pending transasctions
    iocContainer.rebind<number>(INJECTED_VALUES.TxRetryIntervalMs).toConstantValue(0)

    iEnv = new IntegrationEnvironment(false)
    const web3Wrapper = new Web3Wrapper(quorumHost, quorumNode1Port)
    web3 = web3Wrapper.web3Instance
    await iEnv.beforeAll()

    accounts = await web3.eth.getAccounts()

    txDataAgent = new TransactionDataAgent()
  })

  beforeEach(async () => {
    await iEnv.beforeEach(web3)

    consumerMicroservice = new ConsumerMicroservice(iEnv.mockedIds.publisherId)
    await consumerMicroservice.beforeEach()

    // Initialize private keys
    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKeyRequest)
    ethPublicData.address = data.address
    ethPublicData.publicKey = data.publicKey
    ethPublicData.publicKeyCompressed = data.publicKeyCompressed
  })

  afterEach(async () => {
    // Wait for recovery of server state (avoids restarting the server)
    await sleep(1000)

    // Drop collections
    await iEnv.cleanTransactionCollection()

    await consumerMicroservice.afterEach()
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  async function deploySmartContract(): Promise<any> {
    const contract = await getContract()

    return contract
      .deploy({
        data: TestContract.bytecode,
        arguments: []
      })
      .send()
  }

  function getContract(address?: string): any {
    return new web3.eth.Contract(TestContract.abi, address, {
      from: accounts[0],
      gasPrice: defaultGasValues.gasPrice,
      gas: defaultGasValues.gasLimitPerTransaction
    })
  }
})


/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers.
 */
describe('SignController integration test', () => {
  let iEnv: IntegrationEnvironment
  let consumerMicroservice: ConsumerMicroservice
  let web3: Web3
  let accounts: string[]
  const ethPublicData: IETHPublicData = {
    address: '',
    publicKey: '',
    publicKeyCompressed: ''
  }
  let txDataAgent: TransactionDataAgent

  const quorumHost = 'localhost'
  const quorumNode1Port = '22001'

  beforeAll(async () => {
    iocContainer.rebind<number>(INJECTED_VALUES.TxRetryIntervalMs).toConstantValue(5000)
    iEnv = new IntegrationEnvironment(false)
    const web3Wrapper = new Web3Wrapper(quorumHost, quorumNode1Port)
    web3 = web3Wrapper.web3Instance
    await iEnv.beforeAll()

    accounts = await web3.eth.getAccounts()

    txDataAgent = new TransactionDataAgent()
  })

  beforeEach(async () => {
    await iEnv.beforeEach(web3)

    consumerMicroservice = new ConsumerMicroservice(iEnv.mockedIds.publisherId)
    await consumerMicroservice.beforeEach()

    // Initialize private keys
    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKeyRequest)
    ethPublicData.address = data.address
    ethPublicData.publicKey = data.publicKey
    ethPublicData.publicKeyCompressed = data.publicKeyCompressed
  })

  /**
   * Given:
   * A payload is sent to sign endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns a signed message (verified by calling the verify endpoint)
   */
  it('should sign a message successfully', async done => {
    const { data } = await iEnv.postAPISigner('signer/sign', rawData)
    const verifyRequest: IVerifyETHRequest = {
      payload: rawData.payload,
      signature: data,
      address: ethPublicData.address
    }
    const res = await iEnv.postAPISigner('signer/verify', verifyRequest)
    expect(res.data.isValid).toBe(true)

    done()
  })

  /**
   * Given:
   * A payload is sent to encrypt endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns an encrypted message, encrypted using the public key. Decrypted by calling the decrypt endpoint
   */
  it('should encrypt a message successfully', async done => {
    const encryptRawData: IEncryptRequest = {
      payload: rawData.payload,
      publicKey: ethPublicData.publicKey
    }
    const { data } = await iEnv.postAPISigner('signer/encrypt', encryptRawData)

    const decryptRequest: IPayloadRequest = {
      payload: data
    }
    const res = await iEnv.postAPISigner('signer/decrypt', decryptRequest)

    expect(res.data).toBe(encryptRawData.payload)

    done()
  })

  /**
   * Given:
   * A payload is sent to encrypt endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns an encrypted message, encrypted using the compressed public key. Decrypted by calling the decrypt endpoint
   */
  it('should encrypt a message successfully with compressed public key', async done => {
    const encryptRawData: IEncryptRequest = {
      payload: rawData.payload,
      publicKey: ethPublicData.publicKeyCompressed
    }
    const { data } = await iEnv.postAPISigner('signer/encrypt', encryptRawData)

    const decryptRequest: IPayloadRequest = {
      payload: data
    }
    const res = await iEnv.postAPISigner('signer/decrypt', decryptRequest)

    expect(res.data).toBe(encryptRawData.payload)

    done()
  })

  /**
   * Given:
   * A payload is sent to send-tx endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns a transaction id and the database is updated
   */
  it('should send a transaction to the blockchain node successfully', async () => {
    const contract = await deploySmartContract()
    const txData = contract.methods.emitEvents(1).encodeABI()

    const result = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txData })

    const txId = result.data
    const txBeforeConfirmation = await txDataAgent.getTransaction(txId)

    // Transaction params
    expect(txBeforeConfirmation.from).toBe(ethPublicData.address)
    expect(txBeforeConfirmation.status).toBe(TransactionStatus.Pending)
    expect(txBeforeConfirmation.requestOrigin).toBe(rawTxRequest.requestOrigin)
    expect(txBeforeConfirmation.attempts).toBe(0)

    // Transaction body
    expect(txBeforeConfirmation.body.from).toBe(ethPublicData.address)
    expect(txBeforeConfirmation.body.to).toBe(rawTxRequest.to)
    expect(txBeforeConfirmation.body.value).toBe(rawTxRequest.value)
    expect(txBeforeConfirmation.body.data).toBe(txData)

    const tx = await waitForTransactionCompletion(txId)
    expect(tx.receipt).toBeDefined()
    expect(tx.hash).toBe(tx.receipt.transactionHash)
    expect(tx.status).toEqual(TransactionStatus.Confirmed)
    expect(tx.attempts).toEqual(1)
    expect(tx.context).toEqual(context)
  })

  /**
   * Given:
   * A transaction with the same id is set twice
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server execute a transaction only once
   */
  it('can tolerate duplicated transactions', async () => {
    const contract = await deploySmartContract()
    const txData = contract.methods.emitEvents(1).encodeABI()

    const objectId = new bson.ObjectID()
    const generatedId = objectId.toHexString()

    const result1 = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, id: generatedId, data: txData })
    const result2 = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, id: generatedId, data: txData })
    const txId1 = result1.data
    const txId2 = result2.data

    expect(txId1).toEqual(generatedId)
    expect(txId2).toEqual(generatedId)

    const txBeforeConfirmation = await txDataAgent.getTransaction(generatedId)

    // Transaction params
    expect(txBeforeConfirmation.from).toBe(ethPublicData.address)
    expect(txBeforeConfirmation.status).toBe(TransactionStatus.Pending)
    expect(txBeforeConfirmation.requestOrigin).toBe(rawTxRequest.requestOrigin)
    expect(txBeforeConfirmation.attempts).toBe(0)

    // Transaction body
    expect(txBeforeConfirmation.body.from).toBe(ethPublicData.address)
    expect(txBeforeConfirmation.body.to).toBe(rawTxRequest.to)
    expect(txBeforeConfirmation.body.value).toBe(rawTxRequest.value)
    expect(txBeforeConfirmation.body.data).toBe(txData)

    const tx = await waitForTransactionCompletion(generatedId)
    expect(tx.receipt).toBeDefined()
    expect(tx.hash).toBe(tx.receipt.transactionHash)
    expect(tx.status).toEqual(TransactionStatus.Confirmed)
    expect(tx.attempts).toEqual(1)
    expect(tx.context).toEqual(context)
  })

  /**
   * Given:
   * A payload is sent to send-tx endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns a transaction hash, the transaction is set as reverted,
   * an error message is received in the dummy microservice
   */
  it('should fail with a revert error when sending a transaction to the blockchain network', async done => {
    const contract = await deploySmartContract()
    // Will fail because number of events is >= 10
    const txdata = contract.methods.emitEvents(11).encodeABI()
    const { data } = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txdata })
    const txId = data

    const verifyCallback = async (errorObject: SendTxResultMessage) => {
      expect(errorObject.errorType).toEqual('SendTransactionError')
      expect(errorObject.message).toBeDefined()
      expect(errorObject.context).toEqual(context)

      const tx = await waitForTransactionCompletion(txId)
      expect(tx.hash).toEqual(errorObject.txHash)
      expect(tx.status).toEqual(TransactionStatus.Reverted)

      done()
    }

    await verifyReceivedMessageInDummyMicroservice(
      consumerMicroservice,
      iEnv.mockedIds.publisherId,
      verifyCallback)
  })

  /**
   * Given:
   * A payload is sent to send-tx endpoint
   *
   * When:
   * Server is already running
   * RabbitMQ is down
   *
   * Then:
   * the server returns a transaction hash, the transaction is set as reverted,
   * RabbitMQ recovers
   * an error message is received in the dummy microservice
   */
  it('should recover if RabbitMQ is down while sending a message about transaction execution', async done => {
    const verifyCallback = async (errorObject: SendTxResultMessage) => {
      expect(errorObject.errorType).toEqual('SendTransactionError')
      expect(errorObject.message).toBeDefined()

      done()
    }

    await verifyReceivedMessageInDummyMicroservice(
      consumerMicroservice,
      iEnv.mockedIds.publisherId,
      verifyCallback)

    const contract = await deploySmartContract()
    // Will fail because number of events is >= 10
    const txdata = contract.methods.emitEvents(11).encodeABI()
    await iEnv.pauseRabbitMQ()

    await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txdata })

    await sleep(4000)
    await iEnv.unpauseRabbitMQ()
  })

  /**
   * Given:
   * Two payloads are sent to send-tx endpoint synchronously
   *
   * When:
   * Server is already running
   *
   * Then:
   * The first transaction should fail and increment the nonce, the second transaction should succeed
   */
  it('send 2 transactions synchronously, the first should fail and increment the nonce, the second should succeed', async () => {
    const contract = await deploySmartContract()

    // tx 1 will fail because number of events is >= 10
    const txData1 = contract.methods.emitEvents(11).encodeABI()
    // tx 2 will succeed
    const txData2 = contract.methods.emitEvents(1).encodeABI()

    const result1 = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txData1 })
    const result2 = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txData2 })

    const txId1 = result1.data
    const txId2 = result2.data

    const tx1 = await waitForTransactionCompletion(txId1)
    const tx2 = await waitForTransactionCompletion(txId2)

    expect(tx1.status).toBe(TransactionStatus.Reverted)
    expect(tx2.status).toBe(TransactionStatus.Confirmed)
  })

  /**
   * Given:
   * Two payloads are sent to send-tx endpoint concurrently
   *
   * When:
   * Server is already running
   *
   * Then:
   * All transactions should succeed eventually
   */
  it('send many transactions concurrently, all should succeed eventually (depends on PC speed)', async () => {
    const nbTransactions = 10

    const contract = await deploySmartContract()
    const txData = contract.methods.emitEvents(1).encodeABI()

    const txIds: string[] = []
    for (let i = 0; i < nbTransactions; i++) {
      iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txData }).then(result => txIds.push(result.data))
    }

    // As there are som many TX to check, wait a little before setting off waitForExpect
    await sleep(8000)

    for (let i = 0; i < nbTransactions; i++) {
      const tx = await waitForTransactionCompletion(txIds[i])
      expect(tx.status).toBe(TransactionStatus.Confirmed)
    }
  })

  it('should fail to find transaction status for unexisting tx id', async () => {
    // valid ObjectId, not found?
    const txId = '5c8a73c9b1a4f00fd393b943'

    let errorResponse
    try {
      await iEnv.getAPISigner(`signer/tx-status/${txId}`)
    } catch (err) {
      errorResponse = err
    }

    expect(errorResponse.response.status).toBe(404)
  })

  it('transaction status, sucessfully find tx', async () => {
    const contract = await deploySmartContract()

    // tx will succeed
    const txData = contract.methods.emitEvents(1).encodeABI()
    const result = await iEnv.postAPISigner('signer/send-tx', { ...rawTxRequest, data: txData })
    const txId = result.data
    const txConfirmation = await waitForTransactionCompletion(txId)

    const txStatusResult = await iEnv.getAPISigner(`signer/tx-status/${txId}`)
    expect(txStatusResult.status).toBe(200)
    expect(txStatusResult.data.hash).toBe(txConfirmation.hash)
    expect(txStatusResult.data.status).toBe(TransactionStatus.Confirmed)
  })

  /**
   * Given:
   * A payload is sent to encrypt endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns an error when decrypting
   */
  it('should fail to decrypt a message if encrypted with wrong public key', async done => {
    const encryptRawData: IEncryptRequest = {
      payload: rawData.payload,
      publicKey: externalPublicKey
    }
    const { data } = await iEnv.postAPISigner('signer/encrypt', encryptRawData)

    const decryptRequest: IPayloadRequest = {
      payload: data
    }

    let resultResponse
    try {
      await iEnv.postAPISigner('signer/decrypt', decryptRequest)
    } catch ({ response }) {
      resultResponse = response
    }

    expect(resultResponse.status).toBe(500)

    done()
  })

  /**
   * Given:
   * A payload is sent to sign endpoint
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server returns an error when verifying signature
   */
  it('should fail to verify a message if verified with wrong signature', async done => {
    const verifyRequest: IVerifyETHRequest = {
      payload: rawData.payload,
      signature: 'badSignature',
      address: ethPublicData.address
    }

    let resultResponse
    try {
      await iEnv.postAPISigner('signer/verify', verifyRequest)
    } catch ({ response }) {
      resultResponse = response
    }

    expect(resultResponse.status).toBe(400)

    logger.info('should fail to verify a message if verified with wrong signature END')
    done()
  })

  afterEach(async () => {
    // Wait for recovery of server state (avoids restarting the server)
    await sleep(1000)

    // Drop collections
    await iEnv.cleanTransactionCollection()

    await consumerMicroservice.afterEach()
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  async function deploySmartContract(): Promise<any> {
    const contract = await getContract()

    return contract
      .deploy({
        data: TestContract.bytecode,
        arguments: []
      })
      .send()
  }

  function getContract(address?: string): any {
    return new web3.eth.Contract(TestContract.abi as AbiItem[], address, {
      from: accounts[0],
      gasPrice: defaultGasValues.gasPrice,
      gas: defaultGasValues.gasLimitPerTransaction,
      data: TestContract.bytecode
    })
  }
})
