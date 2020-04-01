import 'reflect-metadata'
import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'

import { ContractAddressDataAgent, EventProcessedDataAgent } from '../../src/data-layer/data-agents'
import { AutoWhitelist } from '../../src/data-layer/models/auto-whitelist'
import { ContractAddressStatus, ContractAddress } from '../../src/data-layer/models/contract-address'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import PrivateAutoWhitelistService from '../../src/service-layer/PrivateAutoWhitelistService'
import DeactivatedContract from '../contracts/TestContract.json'
import LightContractLibraryMock from '../LightContractLibraryMock'

import { ACCOUNT_PASSWORD, deploySmartContract, getContract } from './utils/blockchain-utils'
import IntegrationEnvironment from './utils/IntegrationEnvironment'

// Wait for quorum and mongo
jest.setTimeout(150000)

/**
 * This integration test uses MongoDB and Quorum real containers
 */
describe('PrivateAutoWhitelist Integration', () => {
  let iEnv: IntegrationEnvironment
  let service: PrivateAutoWhitelistService
  let contractAddressDataAgent: ContractAddressDataAgent
  let web3: Web3
  let account: string
  let receipt: TransactionReceipt

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment(true, false)
    web3 = await iEnv.beforeAll()
    account = await web3.eth.personal.newAccount(ACCOUNT_PASSWORD)

    contractAddressDataAgent = iocContainer.get<ContractAddressDataAgent>(TYPES.ContractAddressDataAgent)
    // Use the mocked light contract library for the tests
    iocContainer.rebind<any>(VALUES.LightContractLibrary).toConstantValue(LightContractLibraryMock)
    service = iocContainer.get<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)

    receipt = await deployDeactivatedContract()
  })

  afterEach(async () => {
    await AutoWhitelist.deleteMany({})
    await ContractAddress.deleteMany({})
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  /**
   * Given:
   * Auto whitelist env var is set to some block
   * A deprecated komgo contract is deployed before the block
   *
   * When:
   * Service starts
   *
   * Then:
   * The contract address is auto-whitelisted
   */
  it('should whitelist deprecated komgo contract which was deployed before env variable AutoWhitelistBeforeBlock', async () => {
    setAutoWhitelistBeforeBlock(receipt.blockNumber + 5)

    await service.start()

    const status = await contractAddressDataAgent.getStatus(receipt.contractAddress)
    expect(status).toBe(ContractAddressStatus.Whitelisted)
  })

  /**
   * Given:
   * Auto whitelist env var is unset (default is 0)
   * Some events have already been processed previously, up until block 10 (lastEventProcessed.blockNumber = X)
   * A deprecated komgo contract is deployed before block X
   *
   * When:
   * Service starts
   *
   * Then:
   * The contract address is auto-whitelisted
   */
  it('should whitelist deprecated komgo contract which was deployed before last event processed', async () => {
    setAutoWhitelistBeforeBlock(0) // zero value env var is ignored as the default
    await setLastEventProcessedBlock(receipt.blockNumber + 7)

    await service.start()

    const status = await contractAddressDataAgent.getStatus(receipt.contractAddress)
    expect(status).toBe(ContractAddressStatus.Whitelisted)
  })

  /**
   * Given:
   * Auto whitelist env var is set to some block X
   * Some event has already been processed previously, in a block Z such that X > Z
   * A deprecated komgo contract is deployed in block Y such that X > Y > Z
   *
   * When:
   * Service starts
   *
   * Then:
   * The contract address is auto-whitelisted
   */
  it('should prefer env variable AutoWhitelistBeforeBlock to last event processed when both are provided', async () => {
    await setLastEventProcessedBlock(receipt.blockNumber - 2)
    setAutoWhitelistBeforeBlock(receipt.blockNumber + 2)

    await service.start()

    const status = await contractAddressDataAgent.getStatus(receipt.contractAddress)
    expect(status).toBe(ContractAddressStatus.Whitelisted)
  })

  /**
   * Given:
   * Service starts
   * Service stops at block X
   *
   * When:
   * Service starts again
   *
   * Then:
   * Service starts from block X
   *
   * We can test this by blacklisting a contract that is whitelisted already.
   * Then checking it is not re-whitelisted
   */
  it('should start whitelisting where it last left off', async () => {
    setAutoWhitelistBeforeBlock(Infinity) // whitelist all blocks until current block.
    await service.start() // First contract already deployed in beforeEach, auto-whitelist it.

    let firstStatus = await contractAddressDataAgent.getStatus(receipt.contractAddress)
    expect(firstStatus).toBe(ContractAddressStatus.Whitelisted) // check it is whitelisted
    contractAddressDataAgent.blacklist(receipt.contractAddress, receipt.transactionHash) // blacklist it manually

    await service.start()

    firstStatus = await contractAddressDataAgent.getStatus(receipt.contractAddress)
    expect(firstStatus).toBe(ContractAddressStatus.Blacklisted) // first is still blacklisted
  })

  async function setLastEventProcessedBlock(blockNumber: number) {
    const agent = iocContainer.get<EventProcessedDataAgent>(TYPES.EventProcessedDataAgent)
    return agent.saveEventProcessed(blockNumber, '0x', 0)
  }

  function setAutoWhitelistBeforeBlock(blockNumber: number) {
    iocContainer.rebind<number>(VALUES.AutoWhitelistBeforeBlock).toConstantValue(blockNumber)
    iocContainer
      .rebind<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)
      .to(PrivateAutoWhitelistService)
      .inSingletonScope()
    iocContainer.rebind<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService).to(PrivateAutoWhitelistService)
    service = iocContainer.get<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)
  }

  function deployDeactivatedContract() {
    const deactivatedContractABI = DeactivatedContract.abi

    const contract = getContract(deactivatedContractABI, account, web3)
    const bytecode = DeactivatedContract.bytecode

    return deploySmartContract(contract, bytecode, web3, account)
  }
})
