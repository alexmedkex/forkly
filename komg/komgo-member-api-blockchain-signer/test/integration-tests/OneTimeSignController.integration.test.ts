import 'jest'
import { Web3Wrapper } from '@komgo/blockchain-access'
import 'reflect-metadata'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'

import { AddrIndex } from '../../src/data-layer/models/addr-index/index'

import TestContract from './contracts/TestContract'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { sleep } from './utils/utils'

// to allow time for RabbitMQ to start
jest.setTimeout(220000)

const MNEMONIC = 'buyer try humor into improve thrive fruit funny skate velvet vanish live'
const address1 = '0x1dcde766a577abfe76bf32c1f0032fcd24f3a6c0'
const address2 = '0xb5f30b19c2b2fd418d5ea2e07b26bc1ef90c2c39'

const quorumNode2PublicKey = 'iO8XbAo/r8yHU+f1RK8evDW+vYmiUkxHXb98JIsPCw8='

const defaultGasValues = {
  gasPrice: '0x0',
  gasLimitPerTransaction: 6000000
}

/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers.
 */
describe('OneTimeSignController integration test', () => {
  let iEnv: IntegrationEnvironment
  let node1Web3: Web3
  let accounts: string[]
  const quorumHost = 'localhost'
  const quorumNode1Port = '22001'
  const quorumNode2Port = '22002'
  const quorumNode3Port = '22003'

  // This is the sha3 hash of the EmittedName event on the smart contract that is deployed
  const eventEmittedHash = '0xbb02cddae59d501d1fcf63888ace3fad45eb43ca3387d34e3bb6a29be957e3f1'

  beforeEach(async () => {
    await iEnv.beforeEach(node1Web3)
  })

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()

    const web3Wrapper = new Web3Wrapper(quorumHost, quorumNode1Port)
    node1Web3 = web3Wrapper.web3Instance

    await iEnv.beforeAll()

    accounts = await node1Web3.eth.getAccounts()
  })

  /**
   * Given:
   * one-time-signer/key get endpoint is called multiple times
   *
   * When:
   * Server is already running and a mnemonic ENV variable is set
   *
   * Then:
   * the server returns multiple deterministic ETH address by increasing the index
   */
  it('should return multiple deterministic ETH address successfully', async () => {
    const mnemonicHash = node1Web3.utils.sha3(MNEMONIC)
    const resBefore = await AddrIndex.findOne({ mnemonicHash })
    expect(resBefore).toEqual(null)

    const response1 = await iEnv.getAPISigner('one-time-signer/key')
    const response2 = await iEnv.getAPISigner('one-time-signer/key')

    const resAfter = await AddrIndex.findOne({ mnemonicHash })
    expect(resAfter.addrIndex).toEqual(2)
    expect(response1.data).toEqual(address1)
    expect(response2.data).toEqual(address2)
  })

  /**
   * Given:
   * A private trasaction is sent to a smart contract for quorum node 2
   *
   * When:
   * Server is already running
   *
   * Then:
   * the server posts the private trasaction to node 1 blockchan.  Only
   * node 2 can see the event emitted from the smart contract
   */
  it('should be able to post a private Transaction to a node', async () => {
    // deploy the contract privately for quorum node 2
    const contract = await deploySmartContract([quorumNode2PublicKey])

    const txData = contract.methods.emitEvents(1).encodeABI()
    const resultGet = await iEnv.getAPISigner('one-time-signer/key')
    const address = resultGet.data

    // send a private transaction to quorum node 2
    const result = await iEnv.postAPISigner('one-time-signer/transaction', {
      from: address,
      to: contract.options.address,
      data: txData,
      value: '0x0',
      gas: 300000000,
      privateFor: [quorumNode2PublicKey]
    })

    const txHash = result.data
    await verifyEventEmmitted(node1Web3, txHash)

    // give the other nodes time to procees the TX
    sleep(8000)
    const node2Web3Wrapper = new Web3Wrapper(quorumHost, quorumNode2Port)
    await verifyPrivateTransaction(node2Web3Wrapper, txHash)
    // check node2 can see the private emitted event
    await verifyEventEmmitted(node2Web3Wrapper.web3Instance, txHash)

    // check node3 did not see the private emitted event
    const node3Web3Wrapper = new Web3Wrapper(quorumHost, quorumNode3Port)
    const receipt = await node3Web3Wrapper.web3Instance.eth.getTransactionReceipt(txHash)
    expect(receipt.logs.length).toBe(0)
  })

  afterEach(async () => {
    await iEnv.afterEach()
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

    const resultGet = await iEnv.getAPISigner('one-time-signer/key')
    const address = resultGet.data

    const result = await iEnv.postAPISigner('one-time-signer/transaction', {
      from: address,
      data: encodedData,
      value: '0x0',
      gas: 300000000,
      privateFor
    })
    const receipt = await node1Web3.eth.getTransactionReceipt(result.data)

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

  async function verifyEventEmmitted(web3Instance: Web3, txHash: string) {
    const receipt = await web3Instance.eth.getTransactionReceipt(txHash)

    // Verify the expected event was emitted by comparing the hash in the logs topic
    // to the sha3 hash of 'EventEmitted(address,uint256)'
    const eventEmittedHashInLog = receipt.logs[0].topics[0]
    expect(eventEmittedHashInLog).toBe(eventEmittedHash)
  }

  async function verifyPrivateTransaction(node2Web3Wrapper: Web3Wrapper, txHash: any) {
    const tx = await node2Web3Wrapper.web3Instance.eth.getTransaction(txHash)
    // @ts-ignore: v is not included in the Transaction type
    expect(isVPrivateValue(tx.v)).toBeTruthy()
  }

  function isVPrivateValue(txV: string) {
    // a private transaction will have hex 0x26 or 0x27(37/38 decimal) as the v value
    // ref: https://github.com/jpmorganchase/quorum/wiki/Transaction-Processing
    return txV === '0x25' || txV === '0x26'
  }
})
