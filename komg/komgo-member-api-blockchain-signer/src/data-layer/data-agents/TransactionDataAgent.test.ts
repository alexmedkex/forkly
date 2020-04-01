import 'jest'
import 'reflect-metadata'

import { Transaction, ITransaction } from '../models/transaction'
import { TransactionStatus } from '../models/transaction/TransactionStatus'

import TransactionDataAgent from './TransactionDataAgent'
import { MongoError } from 'mongodb'
import { TX_ID } from '../../utils/test-data'
import { MONGODB_DUPLICATE_ERROR } from '../constants/mongo'
import { IRawTx } from '../../business-layer/transactions/models'
import { Nonce } from '../models/nonce/Nonce'
import { INonce } from '../models/nonce/INonce'
import { DocumentQuery } from 'mongoose'

const TX_HASH = '0xTxHash'
const ACCOUNT = '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e'
const RECEIVER_ACCOUNT = '0xC7ed7D093a81f7Fd2860f9e36A4bB88Efca94A47'
const REQUEST_ORIGIN = 'requestOrigin'

const sampleRawTx: IRawTx = {
  from: ACCOUNT,
  to: RECEIVER_ACCOUNT,
  value: '0x0',
  gas: 314159,
  gasPrice: '0x0',
  data: 'txData'
}

const completePendingTx: ITransaction = {
  id: TX_ID,
  from: ACCOUNT,
  nonce: 0,
  body: {
    to: RECEIVER_ACCOUNT,
    value: '0x0',
    gas: 314159,
    gasLimit: 314159,
    gasPrice: '0x0',
    data: 'txData'
  },
  hash: TX_HASH,
  status: '0x0',
  mined: false,
  receipt: {},
  requestOrigin: '',
  attempts: 0
}

const sampleTxReceipt = {
  transactionHash: TX_HASH,
  status: true,
  blockNumber: 666
}

const txContext = {
  key: 'value'
}

describe('TransactionDataAgent', () => {
  let agent: TransactionDataAgent

  beforeEach(() => {
    agent = new TransactionDataAgent()
  })

  describe('getTransaction', () => {
    it('should be called with the right parameters', async () => {
      Transaction.findById = jest.fn()

      await agent.getTransaction(TX_ID)
      expect(Transaction.findById).toHaveBeenCalledWith(TX_ID)
    })
  })

  describe('addNewTransaction', () => {
    const mockCreate = jest.fn()
    const mockFindById = jest.fn()

    beforeEach(() => {
      jest.resetAllMocks()
      Transaction.create = mockCreate
      Transaction.findById = mockFindById
    })

    it('should be called with the right parameters', async () => {
      await agent.addNewTransaction(sampleRawTx, undefined, REQUEST_ORIGIN, txContext)
      expect(Transaction.create).toHaveBeenCalledWith({
        from: ACCOUNT,
        body: sampleRawTx,
        requestOrigin: REQUEST_ORIGIN,
        context: txContext
      })
    })

    it('should re-throw a non-Mongo error', async () => {
      const error = new Error('Non Mongo error')
      mockCreate.mockRejectedValue(error)

      const call = agent.addNewTransaction(sampleRawTx, undefined, REQUEST_ORIGIN, txContext)
      expect(call).rejects.toThrowError(error)
    })

    it('should re-throw a Mongo error unrelated to duplicated _id value', async () => {
      const error = createMongoError('Something happened')
      mockCreate.mockRejectedValue(error)

      const call = agent.addNewTransaction(sampleRawTx, undefined, REQUEST_ORIGIN, txContext)
      expect(call).rejects.toThrowError(error)
    })

    it('return existing transaction if tries to store a transaction with an existing _id field value', async () => {
      const error = createMongoError(
        "E11000 duplicate key error collection: api-signer-test.transactions index: _id_ dup key: { : ObjectId('5cc70aa778aae57777f90e7c') }"
      )
      mockCreate.mockRejectedValue(error)

      mockFindById.mockResolvedValue(sampleRawTx)

      const res = await agent.addNewTransaction(sampleRawTx, TX_ID, REQUEST_ORIGIN, txContext)
      expect(res).toEqual(sampleRawTx)
    })
  })

  describe('updateTransactionHash', () => {
    it('should be called with the right parameters', async () => {
      Transaction.updateOne = jest.fn()

      await agent.updateTransactionHash(TX_ID, TX_HASH)
      expect(Transaction.updateOne).toHaveBeenCalledWith({ _id: TX_ID }, { $set: { hash: TX_HASH } })
    })
  })

  describe('updateTransactionNonceAndAttempts', () => {
    beforeEach(() => {
      jest.resetAllMocks()

      const mockTransactionFindOneAndUpdate = {
        exec: jest.fn(() => Promise.resolve(sampleRawTx))
      }

      const findOneAndUpdateMock = jest.fn(() => mockTransactionFindOneAndUpdate)

      Transaction.findOneAndUpdate = findOneAndUpdateMock as any
      Transaction.findOne = jest.fn(() => {
        return {
          exec: jest.fn(() => Promise.resolve(undefined))
        } as any
      })

      const mockSession = {
        startTransaction: jest.fn(() => {}),
        abortTransaction: jest.fn(() => {}),
        commitTransaction: jest.fn(() => {})
      }

      const mockMongoDb = {
        startSession: jest.fn(() => mockSession)
      }

      Transaction.db = mockMongoDb as any

      const mockedNonceQuery = {
        exec: jest.fn(() => Promise.resolve(9763))
      }

      const mockedFailedNonceQuery = {
        exec: jest.fn(() => Promise.resolve(undefined))
      }

      Nonce.updateOne = jest.fn(() => mockedFailedNonceQuery as any)
      Nonce.findOneAndUpdate = jest.fn(() => mockedNonceQuery as any)
    })

    it('should be called with the right parameters', async () => {
      const mockDocumentQuery = {
        exec: jest.fn(() => Promise.resolve(completePendingTx)),
        sort: jest.fn(() => mockDocumentQuery),
        limit: jest.fn(() => mockDocumentQuery)
      } as any

      Transaction.findOneAndUpdate = jest.fn(() => mockDocumentQuery as any)

      const findOneMock = jest.fn()
      findOneMock.mockReturnValueOnce({ exec: jest.fn(() => undefined) })
      findOneMock.mockReturnValueOnce(mockDocumentQuery)
      Transaction.findOne = findOneMock

      await agent.updateTransactionNonceAndAttempts(completePendingTx)

      expect(Transaction.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: TX_ID, nonce: { $exists: false } },
        { $set: { nonce: undefined }, $inc: { attempts: 1 } },
        { new: true }
      )
    })

    it('should forceably assign new nonce to tx', async () => {
      await agent.newNonceForTransaction(completePendingTx, 3)

      expect(Transaction.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: completePendingTx.id },
        { $set: { nonce: 3 } },
        { new: true }
      )
    })

    //testing the case we need to reset nonce
    it('should forceably remove nonce from tx', async () => {
      await agent.newNonceForTransaction(completePendingTx, undefined)

      expect(Transaction.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: completePendingTx.id },
        { $unset: { nonce: 1 } },
        { new: true }
      )
    })

    it('should forceably assign new nonce to address', async () => {
      const mockSession = {
        startTransaction: jest.fn(() => {}),
        abortTransaction: jest.fn(() => {}),
        commitTransaction: jest.fn(() => {})
      }

      const mockMongoDb = {
        startSession: jest.fn(() => mockSession)
      }

      Nonce.db = mockMongoDb as any
      await agent.newNonceForAddress(completePendingTx, 2)

      expect(Nonce.updateOne).toHaveBeenCalledWith(
        { address: completePendingTx.from },
        { $set: { nonce: 2 } },
        { upsert: true, new: true }
      )
    })

    it('should abort mongo transaction if error occured', async () => {
      const mockSession = {
        startTransaction: jest.fn(() => {}),
        abortTransaction: jest.fn(() => {}),
        commitTransaction: jest.fn(() => {})
      }

      const mockMongoDb = {
        startSession: jest.fn(() => mockSession)
      }

      Nonce.db = mockMongoDb as any

      Nonce.updateOne = jest.fn(() => {
        throw new Error()
      })

      try {
        await agent.newNonceForAddress(completePendingTx, 2)
        fail('it should fail')
      } catch (e) {
        expect(agent.getAndIncrementNonce(completePendingTx)).resolves.toEqual(2)
      }
    })

    it('should call and set nonce counter to a specific value', async () => {
      await agent.getAndIncrementNonce(completePendingTx)
      expect(Nonce.findOneAndUpdate).toHaveBeenCalled()
    })

    it('should reset nonce to 0 if address is new', async () => {
      const mockedNonceQueryResult = {
        exec: jest.fn(() => Promise.resolve(undefined))
      }
      Nonce.findOneAndUpdate = jest.fn(() => mockedNonceQueryResult as any)

      const newAddressTx = { ...completePendingTx, address: '0xNewAddress' }
      expect(agent.getAndIncrementNonce(newAddressTx)).resolves.toEqual(0)
      expect(Nonce.findOneAndUpdate).toHaveBeenCalled()
    })

    it('should throw incrementing nonce if is too high relative to the previous one', async () => {
      const mockDocumentQuery = {
        exec: jest.fn(() => Promise.resolve(completePendingTx)),
        sort: jest.fn(() => mockDocumentQuery),
        limit: jest.fn(() => mockDocumentQuery)
      } as any

      const mockHighNonce = { address: completePendingTx.from, nonce: completePendingTx.nonce + 2 }

      const mockNonceQuery = {
        exec: jest.fn(() => Promise.resolve(mockHighNonce)),
        sort: jest.fn(() => mockNonceQuery),
        limit: jest.fn(() => mockNonceQuery)
      } as any

      Transaction.findOneAndUpdate = jest.fn(() => {
        return mockDocumentQuery as any
      })

      const findOneMock = jest.fn()
      findOneMock.mockReturnValueOnce({ exec: jest.fn(() => undefined) })
      findOneMock.mockReturnValueOnce(mockDocumentQuery)
      Transaction.findOne = findOneMock
      Transaction.findOneAndUpdate = jest.fn(() => mockDocumentQuery)

      Nonce.findOneAndUpdate = jest.fn(() => mockNonceQuery)

      expect(agent.updateTransactionNonceAndAttempts(completePendingTx)).rejects.toThrowError('nonce too high')
    })

    it('should throw if it fails to update nonce in transaction', async () => {
      const mockDocumentQuery = {
        exec: jest.fn(() => Promise.resolve(completePendingTx)),
        sort: jest.fn(() => mockDocumentQuery),
        limit: jest.fn(() => mockDocumentQuery)
      } as any

      Transaction.findOneAndUpdate = jest.fn(() => {
        return mockDocumentQuery as any
      })

      const findOneMock = jest.fn()
      findOneMock.mockReturnValueOnce({ exec: jest.fn(() => undefined) })
      findOneMock.mockReturnValueOnce(mockDocumentQuery)
      Transaction.findOne = findOneMock

      const mockHighNonce = { address: completePendingTx.from, nonce: completePendingTx.nonce }
      Nonce.findOneAndUpdate = jest.fn(() => mockHighNonce as any)

      Transaction.findOneAndUpdate = jest.fn(() => {
        throw new Error()
      })

      expect(agent.updateTransactionNonceAndAttempts(completePendingTx)).rejects.toThrowError()
    })

    it('should throw if failed to increment nonce', async () => {
      Nonce.findOneAndUpdate = jest.fn(() => {
        throw new Error()
      })
      expect(agent.updateTransactionNonceAndAttempts(completePendingTx)).rejects.toThrowError()
    })

    it('should throw if failed to update tx nonce', async () => {
      Transaction.findOneAndUpdate = jest.fn(() => {
        throw new Error()
      })
      expect(agent.updateTransactionNonceAndAttempts(completePendingTx)).rejects.toThrowError()
    })

    it('should return tx if finds transaction with current nonce', async () => {
      expect(agent.updateTransactionNonceAndAttempts(completePendingTx)).resolves.toEqual(completePendingTx)
    })

    it('should return promise that resolves to the returned transaction', async () => {
      Transaction.findOneAndUpdate = jest.fn(() => {
        return {
          exec: jest.fn(() => Promise.resolve({ ...sampleRawTx, nonce: 7, attempts: 3 }))
        } as any
      })

      Transaction.findOne = jest.fn(() => {
        return {
          exec: jest.fn(() => Promise.resolve({ ...sampleRawTx, nonce: 7, attempts: 3 }))
        } as any
      })

      await expect(agent.updateTransactionNonceAndAttempts(completePendingTx)).resolves.toEqual({
        ...sampleRawTx,
        nonce: 7,
        attempts: 3
      })
    })
  })

  describe('updateTransactionOnSuccess', () => {
    it('should be called with the right parameters', async () => {
      Transaction.updateOne = jest.fn()
      Transaction.findOne = jest.fn(() => {
        return {
          exec: jest.fn(() => Promise.resolve(undefined))
        } as any
      })

      await agent.updateTransactionOnReceipt(TX_ID, sampleTxReceipt as any)
      expect(Transaction.updateOne).toHaveBeenCalledWith(
        { _id: TX_ID },
        { $set: { receipt: sampleTxReceipt, status: TransactionStatus.Confirmed } }
      )
    })
  })

  describe('updateTransactionOnReceipt', () => {
    it('should be called with the right parameters', async () => {
      Transaction.updateOne = jest.fn()

      const mockDocumentQuery = {
        exec: jest.fn(() => Promise.resolve(undefined)),
        sort: jest.fn(() => Promise.resolve(mockDocumentQuery)),
        limit: jest.fn(() => Promise.resolve(mockDocumentQuery))
      } as any

      Transaction.findOne = jest.fn(() => {
        return mockDocumentQuery as any
      })

      await agent.updateTransactionOnReceipt(TX_ID, { ...sampleTxReceipt, status: false })
      expect(Transaction.updateOne).toHaveBeenCalledWith(
        { _id: TX_ID },
        {
          $set: {
            receipt: {
              blockNumber: sampleTxReceipt.blockNumber,
              status: false,
              transactionHash: sampleTxReceipt.transactionHash
            },
            status: TransactionStatus.Reverted
          }
        }
      )
    })
  })

  describe('updateTransactionOnRevert', () => {
    it('should be called with the right parameters', async () => {
      Transaction.updateOne = jest.fn()

      await agent.updateTransactionOnReceipt(TX_ID, { ...sampleTxReceipt, status: false })
      expect(Transaction.updateOne).toHaveBeenCalledWith(
        { _id: TX_ID },
        {
          $set: {
            receipt: {
              blockNumber: sampleTxReceipt.blockNumber,
              status: false,
              transactionHash: sampleTxReceipt.transactionHash
            },
            status: 'reverted'
          }
        }
      )
    })
  })

  describe('getPendingTransactions', () => {
    it('should be called with the right parameters', async () => {
      Transaction.find = jest.fn()
      Transaction.findOne = jest.fn(() => {
        return {
          exec: jest.fn(() => Promise.resolve(undefined))
        } as any
      })

      await agent.getPendingTransactions()
      expect(Transaction.find).toHaveBeenCalledWith({ status: TransactionStatus.Pending })
    })
  })
})

function createMongoError(msg: string) {
  return MongoError.create({
    errmsg: msg,
    code: MONGODB_DUPLICATE_ERROR
  })
}
