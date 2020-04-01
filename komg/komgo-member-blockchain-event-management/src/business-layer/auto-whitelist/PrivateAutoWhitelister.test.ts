import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import Web3 from 'web3'
import { toHex } from 'web3-utils'

import {
  ContractAddressDataAgent,
  LightContractLibraryDataAgent,
  IContractLibraryDataAgent
} from '../../data-layer/data-agents'
import { AutoWhitelistDataAgent } from '../../data-layer/data-agents/AutoWhitelistDataAgent'
import RateLimiter from '../../util/RateLimiter'
import { BlockchainConnectionError } from '../errors'

import { PrivateAutoWhitelister } from './PrivateAutoWhitelister'

const maxRequestsPerSecond = 10
const autoWhitelistChunkSize = 1000
const ethMock: any = {
  getBlockNumber: jest.fn(),
  getPastLogs: jest.fn(() => Promise.resolve([]))
}

describe('PrivateAutoWhitelister', () => {
  let privateAutoWhitelistService: PrivateAutoWhitelister
  let rateLimiterMock: jest.Mocked<RateLimiter>
  let web3Mock: jest.Mocked<Web3>
  let autoWhitelistDataAgentMock: jest.Mocked<AutoWhitelistDataAgent>
  let contractAddressDataAgentMock: jest.Mocked<ContractAddressDataAgent>
  let contractLibraryDataAgentMock: jest.Mocked<IContractLibraryDataAgent>

  beforeEach(() => {
    web3Mock = createMockInstance(Web3)
    web3Mock.eth = ethMock

    contractAddressDataAgentMock = createMockInstance(ContractAddressDataAgent)
    autoWhitelistDataAgentMock = createMockInstance(AutoWhitelistDataAgent)
    contractLibraryDataAgentMock = createMockInstance(LightContractLibraryDataAgent)
    rateLimiterMock = createMockInstance(RateLimiter)
    autoWhitelistDataAgentMock.getStopBlockNumber.mockResolvedValueOnce(0)
    contractLibraryDataAgentMock.isExistingCreateEventSigHash.mockResolvedValue(true)
    rateLimiterMock.wrap.mockImplementation(fn => fn)

    privateAutoWhitelistService = new PrivateAutoWhitelister(
      web3Mock,
      contractAddressDataAgentMock,
      contractLibraryDataAgentMock,
      autoWhitelistDataAgentMock,
      autoWhitelistChunkSize,
      maxRequestsPerSecond,
      rateLimiterMock
    )
  })

  describe('constructor', () => {
    it('should wrap calls to blockchain (getPastLogs and getBlockNumber) in a rate limiter', () => {
      expect(rateLimiterMock.wrap).toHaveBeenCalledWith(ethMock.getBlockNumber)
      expect(rateLimiterMock.wrap).toHaveBeenCalledWith(ethMock.getPastLogs)
    })
  })

  describe('processEvents', () => {
    it('should reject if it cannot get latest block number', async () => {
      ethMock.getBlockNumber.mockRejectedValueOnce(new Error('msg'))

      await expect(privateAutoWhitelistService.processEvents()).rejects.toThrow(BlockchainConnectionError)

      expect(ethMock.getPastLogs).not.toHaveBeenCalled()
    })

    it('should reject if it cannot get start block number', async () => {
      autoWhitelistDataAgentMock.getStartBlockNumber.mockRejectedValueOnce(new Error('msg'))

      await expect(privateAutoWhitelistService.processEvents()).rejects.toThrow(Error)

      expect(ethMock.getPastLogs).not.toHaveBeenCalled()
    })

    describe('Skip auto-whitelist', () => {
      const stopWhitelistingAtBlock = 20 // last block to be whitelisted

      beforeEach(() => {
        // Recreate polling instance for a brand new asyncService on each call
        autoWhitelistDataAgentMock = createMockInstance(AutoWhitelistDataAgent)
        autoWhitelistDataAgentMock.getStopBlockNumber.mockResolvedValueOnce(stopWhitelistingAtBlock)
        privateAutoWhitelistService = new PrivateAutoWhitelister(
          web3Mock,
          contractAddressDataAgentMock,
          contractLibraryDataAgentMock,
          autoWhitelistDataAgentMock,
          autoWhitelistChunkSize,
          maxRequestsPerSecond,
          rateLimiterMock
        )
      })

      it('should do nothing if the start block number is greater than the current block number', async () => {
        const blockNumber = 10
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(blockNumber + 1)
        ethMock.getBlockNumber.mockResolvedValueOnce(blockNumber)

        await privateAutoWhitelistService.processEvents()

        await expectNothingToDo()
      })

      it('should do nothing if the start block number is greater than the indicated "end of whitelisting" block', async () => {
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(stopWhitelistingAtBlock + 1)

        await privateAutoWhitelistService.processEvents()

        await expectNothingToDo()
      })

      async function expectNothingToDo() {
        expect(ethMock.getBlockNumber).toHaveBeenCalled()
        expect(autoWhitelistDataAgentMock.getStartBlockNumber).toHaveBeenCalled()
        expect(ethMock.getPastLogs).not.toHaveBeenCalled()
      }

      it('should reject and not whitelist if it fails to get past logs', async () => {
        const blockNumber = stopWhitelistingAtBlock - 1
        const hexBlockNumber = toHex(blockNumber)
        ethMock.getBlockNumber.mockResolvedValueOnce(blockNumber)
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(blockNumber)
        ethMock.getPastLogs.mockRejectedValueOnce(new Error('msg'))

        await expect(privateAutoWhitelistService.processEvents()).rejects.toThrow(BlockchainConnectionError)

        expect(ethMock.getBlockNumber).toHaveBeenCalled()
        expect(ethMock.getPastLogs).toHaveBeenCalledWith({ fromBlock: hexBlockNumber, toBlock: hexBlockNumber })
        expect(contractAddressDataAgentMock.whitelist).not.toHaveBeenCalled()
      })
    })

    describe('Run auto-whitelist', () => {
      const stopWhitelistingAtBlock = 180 // randomly chosen last block to be whitelisted
      const chunkSize = 40
      const mockLogs = [
        { transactionHash: '0x1', address: 'test-address-1', topics: ['0xabc'] },
        { transactionHash: '0x2', address: 'test-address-2', topics: ['0xabc'] },
        { transactionHash: '0x2', address: 'test-address-2', topics: ['0xabc'] }
      ]
      beforeEach(() => {
        autoWhitelistDataAgentMock = createMockInstance(AutoWhitelistDataAgent)
        autoWhitelistDataAgentMock.getStopBlockNumber.mockResolvedValueOnce(stopWhitelistingAtBlock)
        privateAutoWhitelistService = new PrivateAutoWhitelister(
          web3Mock,
          contractAddressDataAgentMock,
          contractLibraryDataAgentMock,
          autoWhitelistDataAgentMock,
          chunkSize,
          maxRequestsPerSecond,
          rateLimiterMock
        )
      })

      it('should batch requests by chunk size', async () => {
        for (let i = 0; i < 5; i++) {
          ethMock.getPastLogs.mockResolvedValueOnce([])
        }
        ethMock.getBlockNumber.mockResolvedValueOnce(stopWhitelistingAtBlock)
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(11)

        await privateAutoWhitelistService.processEvents()

        expect(ethMock.getPastLogs).toHaveBeenCalledTimes(5)
        const chunks = [[11, 50], [51, 90], [91, 130], [131, 170], [171, 180]]
        for (const [fromBlock, toBlock] of chunks) {
          expect(ethMock.getPastLogs).toHaveBeenCalledWith({
            fromBlock: toHex(fromBlock),
            toBlock: toHex(toBlock)
          })
        }
      })

      it('should whitelist an address from a log', async () => {
        // mock 1 blocks
        const blockNumber = stopWhitelistingAtBlock - 1
        ethMock.getBlockNumber.mockResolvedValueOnce(blockNumber)
        ethMock.getPastLogs.mockResolvedValueOnce([mockLogs[0]])
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(blockNumber)

        await privateAutoWhitelistService.processEvents()

        expect(contractAddressDataAgentMock.whitelist).toHaveBeenCalledTimes(1)
        expect(contractAddressDataAgentMock.whitelist).toHaveBeenCalledWith(
          mockLogs[0].address,
          mockLogs[0].transactionHash
        )
        expect(autoWhitelistDataAgentMock.setStartBlockNumber).toHaveBeenCalledTimes(1)
        expect(autoWhitelistDataAgentMock.setStartBlockNumber).toHaveBeenCalledWith(blockNumber + 1)
      })

      it('should whitelist only known komgo creation events', async () => {
        // mock 1 blocks
        const blockNumber = stopWhitelistingAtBlock - 1
        ethMock.getPastLogs.mockResolvedValueOnce([mockLogs[0]])
        ethMock.getBlockNumber.mockResolvedValueOnce(blockNumber)
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(blockNumber)
        contractLibraryDataAgentMock.isExistingCreateEventSigHash.mockResolvedValueOnce(false)

        await privateAutoWhitelistService.processEvents()

        expect(contractAddressDataAgentMock.whitelist).not.toHaveBeenCalled()
        expect(autoWhitelistDataAgentMock.setStartBlockNumber).toHaveBeenCalledTimes(1)
        expect(autoWhitelistDataAgentMock.setStartBlockNumber).toHaveBeenCalledWith(blockNumber + 1)
      })

      it('should whitelist multiple addresses from multiple logs, transactions and blocks', async () => {
        // mock 2 block
        const start = stopWhitelistingAtBlock - 1
        ethMock.getPastLogs.mockResolvedValueOnce(mockLogs)
        ethMock.getBlockNumber.mockResolvedValueOnce(stopWhitelistingAtBlock)
        autoWhitelistDataAgentMock.getStartBlockNumber.mockResolvedValueOnce(start)

        await privateAutoWhitelistService.processEvents()

        expect(contractAddressDataAgentMock.whitelist).toHaveBeenNthCalledWith(
          1,
          mockLogs[0].address,
          mockLogs[0].transactionHash
        )
        expect(contractAddressDataAgentMock.whitelist).toHaveBeenNthCalledWith(
          2,
          mockLogs[1].address,
          mockLogs[1].transactionHash
        )
        expect(contractAddressDataAgentMock.whitelist).toHaveBeenNthCalledWith(
          3,
          mockLogs[2].address,
          mockLogs[2].transactionHash
        )
        expect(autoWhitelistDataAgentMock.setStartBlockNumber).toHaveBeenCalledTimes(1)
        expect(autoWhitelistDataAgentMock.setStartBlockNumber).toHaveBeenNthCalledWith(1, stopWhitelistingAtBlock + 1)
      })
    })
  })
})
