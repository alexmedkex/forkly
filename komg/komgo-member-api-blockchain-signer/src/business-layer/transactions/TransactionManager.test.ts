import 'jest'
import 'reflect-metadata'

import { createMockInstance } from 'jest-create-mock-instance'

import TransactionDataAgent from '../../data-layer/data-agents/TransactionDataAgent'
import { TransactionStatus } from '../../data-layer/models/transaction/TransactionStatus'

import MessagingClient from './MessagingClient'
import TransactionManager from './TransactionManager'
import Web3Utils from './Web3Utils'
import { ITransaction } from '../../data-layer/models/transaction'
import { TX_ID } from '../../utils/test-data'

const TX_HASH = 'txHash'
const REQUEST_ORIGIN = 'RequestOrigin'
const MAX_ATTEMPTS = 5
const ERROR_MESSAGE = 'errorMessage'
const RECEIVER_ACCOUNT = '0xC7ed7D093a81f7Fd2860f9e36A4bB88Efca94A47'
const ERROR_NONCE_LOW = 'Returned error: nonce too low'
const ERROR_KNOWN_TRANSACTION = 'Known transaction'

const sampleTxHash = '0x526648840ea5b4c489f872109a9b4f2433101d8ab5d1f602d4ad35c3218ff48f'
const sampleTxHashCorrect = '0xCorrectHash'

const sampleReceipt = {
  transactionHash: sampleTxHash,
  blockNumber: 666,
  status: true
}

const sampleReceiptCorrect = {
  transactionHash: sampleTxHashCorrect,
  blockNumber: 666,
  status: true
}

const failureReceipt = {
  transactionHash: sampleTxHash,
  blockNumber: 666,
  status: false
}

const companyEthData = {
  address: '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e',
  privateKey: '0x319f0c0aa7d12b074b67a63580518611374735e902113ae36f7a805085d4b93c'
}

const publicTxBody = {
  from: companyEthData.address,
  to: RECEIVER_ACCOUNT,
  value: '0x0',
  gas: 314159,
  gasLimit: 314159,
  gasPrice: '0x0',
  data: 'txData'
}

const privateTxBody = {
  ...publicTxBody,
  privateFor: ['0xprivateFor0', '0xprivateFor1']
}

const txContext = {
  key: 'value'
}

const sampleTx: ITransaction = {
  id: TX_ID,
  nonce: 0,
  from: companyEthData.address,
  body: publicTxBody,
  hash: TX_HASH,
  status: 'pending',
  mined: false,
  receipt: undefined,
  requestOrigin: REQUEST_ORIGIN,
  attempts: 0,
  context: txContext
}

const txReceiptReverted: ITransaction = {
  ...sampleTx,
  status: '0x0',
  mined: false
}

const samplePrivateTx = {
  ...sampleTx,
  body: privateTxBody
}

const mockWeb3 = {
  eth: {
    getTransactionCount: jest.fn(),
    sendTransaction: jest.fn(),
    sendSignedTransaction: jest.fn(),
    getTransaction: jest.fn(),
    getTransactionReceipt: jest.fn(),
    getBlock: jest.fn()
  }
}

const enum EventNames {
  TransactionHash = 'transactionHash',
  Receipt = 'receipt',
  Error = 'error'
}

const mockPromiEventSuccess = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHash)
    } else if (event === EventNames.Receipt) {
      callback(sampleReceipt)
    }
    return mockPromiEventSuccess
  })
}

const mockPromiEventSuccessCorrect = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHashCorrect)
    } else if (event === EventNames.Receipt) {
      callback(sampleReceiptCorrect)
    }
    return mockPromiEventSuccessCorrect
  })
}

const mockPromiEventError = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHash)
    } else if (event === EventNames.Receipt) {
      callback(sampleReceipt)
    }
    return mockPromiEventError
  }),
  on: jest.fn((event, callback) => {
    if (event === EventNames.Error) {
      callback(new Error(ERROR_MESSAGE))
    }
    return mockPromiEventError
  })
}

const mockPromiEventErrorGasLimit = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHash)
    } else if (event === EventNames.Receipt) {
      callback(txReceiptReverted)
    }
    return mockPromiEventErrorGasLimit
  }),
  on: jest.fn((event, callback) => {
    if (event === EventNames.Error) {
      callback(new Error('Transaction has reached gas limit'))
    }
    return mockPromiEventErrorGasLimit
  })
}

const mockPromiEventDBError = {
  once: jest.fn(() => mockPromiEventDBError),
  on: jest.fn((event, callback) => {
    if (event === EventNames.Error) {
      callback(new Error(ERROR_MESSAGE))
    }
    return mockPromiEventDBError
  })
}

const mockPromiEventErrorWithTx = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHash)
    } else if (event === EventNames.Receipt) {
      callback(failureReceipt)
    }
    return mockPromiEventErrorWithTx
  }),
  on: jest.fn((event, callback) => {
    if (event === EventNames.Error) {
      callback(new Error(ERROR_MESSAGE))
    }
    return mockPromiEventErrorWithTx
  })
}

const mockPromiEventErrorNonceLow = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHash)
    }
    return mockPromiEventErrorNonceLow
  }),
  on: jest.fn((event, callback) => {
    if (event === EventNames.Error) {
      callback(new Error(ERROR_NONCE_LOW))
    }
    return mockPromiEventErrorNonceLow
  })
}

const mockPromiEventErrorKnowTransaction = {
  once: jest.fn((event, callback) => {
    if (event === EventNames.TransactionHash) {
      callback(sampleTxHash)
    }
    return mockPromiEventErrorKnowTransaction
  }),
  on: jest.fn((event, callback) => {
    if (event === EventNames.Error) {
      callback(new Error(ERROR_KNOWN_TRANSACTION))
    }
    return mockPromiEventErrorKnowTransaction
  })
}

describe('TransactionManager', () => {
  let manager: TransactionManager
  let mockTransactionDataAgent: jest.Mocked<TransactionDataAgent>
  let mockMessagingClient: jest.Mocked<MessagingClient>
  let mockWeb3Utils: jest.Mocked<Web3Utils>

  beforeEach(() => {
    mockTransactionDataAgent = createMockInstance(TransactionDataAgent)
    mockMessagingClient = createMockInstance(MessagingClient)
    mockTransactionDataAgent = createMockInstance(TransactionDataAgent)
    mockWeb3Utils = createMockInstance(Web3Utils)

    mockWeb3.eth.getTransactionCount.mockResolvedValue(0)
    mockTransactionDataAgent.updateTransactionNonceAndAttempts.mockResolvedValue(sampleTx)
    mockTransactionDataAgent.incrementTransactionAttempts.mockResolvedValue(sampleTx)

    manager = new TransactionManager(
      mockWeb3Utils,
      mockWeb3 as any,
      mockTransactionDataAgent,
      mockMessagingClient,
      MAX_ATTEMPTS
    )
  })

  function assertPublicTransactionSent() {
    // Expected calls before sending transaction
    expect(mockTransactionDataAgent.updateTransactionNonceAndAttempts).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.sendSignedTransaction).toHaveBeenCalledTimes(1)
  }

  function assertPrivateTransactionSent() {
    expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
  }

  function assertTransactionStateWasNotUpdated() {
    expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(0)
  }

  function assertSuccessfulTransactionMsg() {
    expect(mockMessagingClient.publishSuccessMessage).toHaveBeenCalledTimes(1)
    expect(mockMessagingClient.publishSuccessMessage).toHaveBeenCalledWith({
      ...sampleTx,
      hash: sampleTxHash
    })
  }

  function assertErrorTransactionMsg(tx: ITransaction, txStatus: TransactionStatus, errorMessage = ERROR_MESSAGE) {
    expect(mockMessagingClient.publishErrorMessage).toHaveBeenCalledTimes(1)
    expect(mockMessagingClient.publishErrorMessage).toHaveBeenCalledWith(tx, errorMessage, txStatus)
  }

  describe('sendPrivateTx', () => {
    it('should post a transaction successfully', async () => {
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(mockPromiEventSuccess)

      await manager.sendPrivateTx(samplePrivateTx as any)

      assertPrivateTransactionSent()

      expect(mockTransactionDataAgent.updateTransactionHash).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledWith(
        samplePrivateTx.id,
        sampleReceipt
      )
      assertSuccessfulTransactionMsg()
    })
  })

  describe('sendPublicTx', () => {
    it('should post transaction successfully, receiving txHash and update DB on receipt', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventSuccess)

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      assertPublicTransactionSent()

      expect(mockTransactionDataAgent.updateTransactionHash).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledWith(sampleTx.id, sampleReceipt)
      assertSuccessfulTransactionMsg()
    })

    it('should publish an error message on revert error', async () => {
      await manager.onRevertError(sampleTx as any, txReceiptReverted, ERROR_MESSAGE)

      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledWith(sampleTx.id, txReceiptReverted)
      assertErrorTransactionMsg(sampleTx, TransactionStatus.Reverted)
    })

    it('should not consider transaction reverted on error', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventError)

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      assertPublicTransactionSent()

      expect(mockTransactionDataAgent.updateTransactionHash).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(1)
    })

    it('should publish a message for transaction with an unknown origin', async () => {
      const unknownRequestOriginTransaction: any = { ...sampleTx, requestOrigin: undefined }

      await manager.onRevertError(unknownRequestOriginTransaction, txReceiptReverted, 'errorMessage')

      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.updateTransactionOnReceipt).toHaveBeenCalledWith(sampleTx.id, txReceiptReverted)
      assertErrorTransactionMsg(unknownRequestOriginTransaction, TransactionStatus.Reverted, undefined)
    })

    it('should not update DB nor publish an error message on error (before receiving tx hash)', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventDBError)

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)
      assertTransactionStateWasNotUpdated()
    })

    it('should publish an error message with the right routing key and error object', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventErrorWithTx)

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      assertErrorTransactionMsg(sampleTx, TransactionStatus.Reverted, 'Transaction has reached gas limit')
    })

    it('should not update state of a transaction in DB if the message publisher throws an error', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventErrorWithTx)

      mockMessagingClient.publishErrorMessage.mockRejectedValueOnce(new Error('error'))

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      expect(mockTransactionDataAgent.updateTransactionHash).toHaveBeenCalledTimes(1)
      expect(mockMessagingClient.publishErrorMessage).toHaveBeenCalledTimes(1)
      assertErrorTransactionMsg(sampleTx, TransactionStatus.Reverted, 'Transaction has reached gas limit')
      assertTransactionStateWasNotUpdated()
    })

    it('should not fail if the message publisher throws an error when publishing a successfully executed transaction', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventSuccess)

      mockMessagingClient.publishSuccessMessage.mockRejectedValueOnce(new Error('error'))

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      expect(mockMessagingClient.publishSuccessMessage).toHaveBeenCalledTimes(1)
      assertTransactionStateWasNotUpdated()
    })

    it('should throw if DB connection fails when persisting a public tx', async () => {
      mockTransactionDataAgent.updateTransactionNonceAndAttempts.mockRejectedValueOnce(new Error('error'))

      try {
        await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)
        fail('Should throw an exception')
      } catch (error) {
        // Check that we decrease the count
        expect(error.message).toBe('error')
      }
    })

    it('should throw if DB connection fails when persisting a private tx', async () => {
      mockTransactionDataAgent.incrementTransactionAttempts.mockRejectedValueOnce(new Error('error'))

      try {
        await manager.sendPrivateTx(samplePrivateTx as any)
        fail('Should throw an exception')
      } catch (error) {
        // Check that we decrease the count
        expect(error.message).toBe('error')
      }
    })

    it('should reset nonce to network if tx nonce is too low', async () => {
      const txCount = 3

      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventErrorNonceLow)
      mockWeb3.eth.getTransactionCount.mockReturnValueOnce(txCount)

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      expect(mockWeb3.eth.getTransactionCount).toBeCalledTimes(1)
      expect(mockTransactionDataAgent.newNonceForAddress).toBeCalledTimes(1)
    })

    it('fail to reset nonce to network if tx nonce is too low', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventErrorNonceLow)
      mockWeb3.eth.getTransactionCount.mockRejectedValueOnce(new Error('error'))

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      expect(mockWeb3.eth.getTransactionCount).toBeCalledTimes(1)
      expect(mockTransactionDataAgent.newNonceForAddress).toBeCalledTimes(0)
    })

    it('should report known transaction if node already seen that tx', async () => {
      mockWeb3.eth.sendSignedTransaction.mockReturnValueOnce(mockPromiEventErrorKnowTransaction)

      await manager.sendPublicTx(sampleTx as any, companyEthData.privateKey)

      expect(mockWeb3.eth.getTransactionCount).toBeCalledTimes(0)
      expect(mockTransactionDataAgent.newNonceForAddress).toBeCalledTimes(0)
    })
  })

  describe('persistNewTx', () => {
    it('should persist a new transaction and return it successfully', async () => {
      mockTransactionDataAgent.addNewTransaction.mockResolvedValueOnce(sampleTx)

      const result = await manager.persistNewTx(sampleTx.body, TX_ID, sampleTx.requestOrigin, txContext)

      expect(mockTransactionDataAgent.addNewTransaction).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.addNewTransaction).toBeCalledWith(
        sampleTx.body,
        TX_ID,
        sampleTx.requestOrigin,
        txContext
      )
      expect(result).toBe(sampleTx)
    })
  })
})
