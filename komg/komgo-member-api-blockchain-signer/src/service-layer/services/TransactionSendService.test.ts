import 'jest'
import 'reflect-metadata'

import { createMockInstance } from 'jest-create-mock-instance'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import TransactionManager from '../../business-layer/transactions/TransactionManager'
import Web3Utils from '../../business-layer/transactions/Web3Utils'
import TransactionDataAgent from '../../data-layer/data-agents/TransactionDataAgent'
import { TransactionStatus } from '../../data-layer/models/transaction/TransactionStatus'

import IService from './IService'
import PollingServiceFactory from './PollingServiceFactory'
import TransactionSendService from './TransactionSendService'
import { IETHKeyData } from '../../business-layer/key-management/models/IETHKeyData'
import { ITransaction } from '../../data-layer/models/transaction'
import { TransactionReceipt } from 'web3-core'

const RETRY_INTERVAL_MS = 5

const sampleTxHash = '0xtransactionHash'
const companyEthData: IETHKeyData = {
  address: '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e',
  privateKey: '0x319f0c0aa7d12b074b67a63580518611374735e902113ae36f7a805085d4b93c',
  publicKey: '022a48ca7bf0f51e8c5be7f564c1e339bccdc90b656ffd44db7c00d8e7bd5c1eb1',
  publicKeyCompressed: ''
}

const sampleTx: ITransaction = {
  id: 'tx-id',
  from: companyEthData.address,
  body: {},
  hash: sampleTxHash,
  status: 'pending',
  mined: false,
  requestOrigin: 'requestOrigin',
  nonce: 0,
  receipt: undefined,
  attempts: 0
}

const samplePrivateTx = {
  body: {
    privateFor: ['0x0']
  },
  hash: sampleTxHash,
  status: 'pending',
  mined: false,
  requestOrigin: 'requestOrigin'
}

const sampleTxReceipt: TransactionReceipt = {
  from: '0x0',
  to: '0x0',
  transactionIndex: 0,
  transactionHash: sampleTxHash,
  blockNumber: 0,
  blockHash: '0x0',

  status: true,
  contractAddress: '0x0',
  cumulativeGasUsed: 0,
  gasUsed: 0,
  logs: [],
  logsBloom: 'logs'
}

const asyncService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

describe('TransactionSendService', () => {
  let service: TransactionSendService
  let mockTransactionDataAgent: jest.Mocked<TransactionDataAgent>
  let mockCompanyKeyProvider: jest.Mocked<CompanyKeyProvider>
  let mockTransactionManager: jest.Mocked<TransactionManager>
  let mockWeb3Utils: jest.Mocked<Web3Utils>

  let mockPollingFactory

  beforeEach(() => {
    mockTransactionDataAgent = createMockInstance(TransactionDataAgent)
    mockCompanyKeyProvider = createMockInstance(CompanyKeyProvider)
    mockTransactionManager = createMockInstance(TransactionManager)
    mockWeb3Utils = createMockInstance(Web3Utils)
    mockPollingFactory = createMockInstance(PollingServiceFactory)

    mockPollingFactory.createPolling.mockReturnValue(asyncService)

    mockCompanyKeyProvider.getETHKey.mockResolvedValue(companyEthData)
    mockTransactionManager.sendPublicTx.mockResolvedValue(undefined)

    service = new TransactionSendService(
      RETRY_INTERVAL_MS,
      mockPollingFactory,
      mockTransactionDataAgent,
      mockCompanyKeyProvider,
      mockTransactionManager,
      mockWeb3Utils
    )
  })

  describe('starts and stops', () => {
    it('starts polling when started', async () => {
      await service.start()
      expect(asyncService.start).toHaveBeenCalledTimes(1)
    })

    it('stops polling when stopped', async () => {
      await service.stop()
      expect(asyncService.stop).toHaveBeenCalledTimes(1)
    })
  })

  describe('verifyUnconfirmedTransactions', () => {
    it('should not try to verify transactions if key data is undefined', async () => {
      mockCompanyKeyProvider.getETHKey.mockResolvedValueOnce(undefined)

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(0)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(0)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
    })

    it('should do nothing if there are no unconfirmed transactions', async () => {
      mockUnconfirmedTransactions(0)

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(0)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
    })

    it('should update tx as confirmed if already contained in a block and status is true', async () => {
      const transactionReceipt = { ...sampleTxReceipt, status: true }
      mockUnconfirmedTransactions(1)
      mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(true)
      mockWeb3Utils.getTxReceipt.mockResolvedValueOnce(transactionReceipt)

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.onTransactionSuccess).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.onTransactionSuccess).toHaveBeenCalledWith(
        { ...sampleTx, hash: transactionHash(0), status: TransactionStatus.Pending },
        transactionReceipt
      )
      expect(mockTransactionManager.onRevertError).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
    })

    it('should update tx as reverted if already contained in a block and status is false', async () => {
      mockUnconfirmedTransactions(1)
      mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(true)
      mockWeb3Utils.getTxReceipt.mockResolvedValueOnce({ ...sampleTxReceipt, status: false })

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.onTransactionSuccess).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.onRevertError).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.onRevertError).toHaveBeenCalledWith(
        { ...sampleTx, hash: transactionHash(0), status: TransactionStatus.Pending },
        { ...sampleTxReceipt, status: false },
        'Transaction was reverted'
      )
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
    })

    it('should not update tx as confirmed if still pending in the blockchain', async () => {
      mockUnconfirmedTransactions(1)
      mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(true)
      mockWeb3Utils.getTxReceipt.mockResolvedValueOnce(null)

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
    })

    it('should try to resend tx if not already contained in a block', async () => {
      mockUnconfirmedTransactions(1)
      mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(false)

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(1)
    })

    it('should try to resend private tx if not already contained in a block', async () => {
      mockUnconfirmedPrivateTransactions(1)
      mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(false)

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPrivateTx).toHaveBeenCalledTimes(1)
    })

    it('should try to resend multiple transactions successfully', async () => {
      const nbTransactions = 5
      mockUnconfirmedTransactions(nbTransactions)

      for (let i = 0; i < nbTransactions; i++) {
        mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(false)
      }

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(nbTransactions)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(nbTransactions)
    })

    it('should not fail if an error is returned by getPendingTransactions', async () => {
      mockTransactionDataAgent.getPendingTransactions.mockImplementationOnce(() => {
        throw new Error()
      })

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(0)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
    })

    it('should not fail if isTxInBlock returns an error but stops looping', async () => {
      mockUnconfirmedTransactions(2)

      mockWeb3Utils.isTxInBlock.mockImplementationOnce(() => {
        throw new Error()
      })

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      // Once the first call to isTxInBlock fails, we exit the function so it's only called once
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
    })

    it('should not fail and continue the loop if sendPublicTx returns an error', async () => {
      const nbTransactions = 2
      mockUnconfirmedTransactions(2)

      for (let i = 0; i < nbTransactions; i++) {
        mockWeb3Utils.isTxInBlock.mockResolvedValueOnce(false)
        // Connection is lost (for example) so this function will return an error
        mockTransactionManager.sendPublicTx.mockImplementationOnce(async () => {
          throw new Error()
        })
      }

      await executePollingFunction()

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getPendingTransactions).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isTxInBlock).toHaveBeenCalledTimes(nbTransactions)
      expect(mockWeb3Utils.getTxReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(nbTransactions)
    })
  })

  async function executePollingFunction() {
    const asyncFunction = mockPollingFactory.createPolling.mock.calls[0][0]
    const endFunction = jest.fn()

    await asyncFunction(endFunction)
  }

  const mockUnconfirmedTransactions = (nbTransactions: number) => {
    const txs = []
    for (let i = 0; i < nbTransactions; i++) {
      const tx = { ...sampleTx, hash: sampleTxHash + i }
      txs.push(tx)
    }

    mockTransactionDataAgent.getPendingTransactions.mockResolvedValueOnce(txs)
  }

  const mockUnconfirmedPrivateTransactions = (nbTransactions: number) => {
    const txs = []
    for (let i = 0; i < nbTransactions; i++) {
      const tx = { ...samplePrivateTx, hash: sampleTxHash + i }
      txs.push(tx)
    }

    mockTransactionDataAgent.getPendingTransactions.mockResolvedValueOnce(txs)
  }

  function transactionHash(mockTransactionNum: number): string {
    return sampleTxHash + mockTransactionNum
  }
})
