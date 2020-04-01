import 'jest'
import 'reflect-metadata'

import { createMockInstance } from 'jest-create-mock-instance'
import PromiEvent from 'promievent'

import AddrIndexDataAgent from '../../data-layer/data-agents/AddrIndexDataAgent'
import { IPostPrivateTransaction } from '../../service-layer/request/one-time-signer'
import Web3Utils from '../transactions/Web3Utils'

import OneTimeSigner from './OneTimeSigner'
import { IAddrIndexDocument } from '../../data-layer/models/addr-index'
import VaultClient from '../../infrastructure/vault/VaultClient'
import { MnemonicData } from '../../infrastructure/vault/response/MnemonicData'

const MNEMONIC = 'winter pencil cry century tuition organ curious oak tobacco medal galaxy during'
const TIME_INTERVAL_MS = 5
const ERROR_MESSAGE = 'errorMessage'

const sampleTxHash = '0xtransactionHash'
const newAddress = 'newAddress'
const address0 = '0x3da12644DE159Dd8396a03A715d8c4f8e9FcedFD'
const sampleReceiptWithStatusTrue = {
  status: true,
  transactionHash: sampleTxHash,
  blockNumber: 666
}

const sampleReceiptWithStatusFalse = {
  status: false,
  transactionHash: sampleTxHash,
  blockNumber: 666
}

const mockPrivateTxRequest: IPostPrivateTransaction = {
  from: newAddress,
  data: 'txData',
  value: '0x0',
  privateFor: ['0xprivateFor0', '0xprivateFor1']
}

const mockAddressIndex: IAddrIndexDocument = {
  id: '1',
  mnemonicHash: 'hash',
  addrIndex: 0
}

const mockAddressIndexNext: IAddrIndexDocument = {
  id: '1',
  mnemonicHash: 'next_hash',
  addrIndex: 1
}

const mockWeb3 = {
  utils: {
    toBN: jest.fn(),
    toWei: jest.fn(),
    sha3: jest.fn()
  },
  eth: {
    personal: {
      importRawKey: jest.fn(),
      unlockAccount: jest.fn()
    },
    getBlock: jest.fn(),
    getBalance: jest.fn(),
    sendTransaction: jest.fn(),
    getAccounts: jest.fn().mockReturnValue([])
  }
}

const sleep = (miliseconds: number) => new Promise(resolve => setTimeout(resolve, miliseconds))

const getNewPromiEventError = (): PromiEvent<any> => {
  const promiEvent = new PromiEvent<any>(resolve => {
    let counter = 0

    const timer = setInterval(() => {
      counter++

      if (counter === 1) {
        promiEvent.emit('transactionHash', sampleTxHash)
      }

      if (counter === 2) {
        const error = new Error(ERROR_MESSAGE)
        promiEvent.emit('error', error)
        resolve(error)

        clearInterval(timer)
      }
    }, TIME_INTERVAL_MS)
  })

  return promiEvent
}

const getNewPromiEventErrorWithoutTxHash = (): PromiEvent<any> => {
  const promiEvent = new PromiEvent<any>(resolve => {
    const timer = setInterval(() => {
      const error = new Error(ERROR_MESSAGE)
      promiEvent.emit('error', error)
      resolve(error)

      clearInterval(timer)
    }, TIME_INTERVAL_MS)
  })

  return promiEvent
}

const getNewPromiEventWithReceipt = (receipt): PromiEvent<any> => {
  const promiEvent = new PromiEvent<any>(resolve => {
    let counter = 0

    const timer = setInterval(() => {
      counter++

      if (counter === 1) {
        promiEvent.emit('transactionHash', sampleTxHash)
      }

      if (counter === 2) {
        promiEvent.emit('receipt', receipt)
        resolve(receipt)

        clearInterval(timer)
      }
    }, TIME_INTERVAL_MS)
  })

  return promiEvent
}

const mnemonicData: MnemonicData = {
  mnemonic: 'buyer try humor into improve thrive fruit funny skate velvet vanish live',
  hash: '0xdf2f1a4ecaec56faf23ed6820646d809fbf59cdc9dfcc4eb4c24bf9c3d18b0c0'
}

describe('OneTimeSigner', () => {
  let signer: OneTimeSigner
  let mockWeb3Utils: jest.Mocked<Web3Utils>
  let mockAddrIndexDataAgent: jest.Mocked<AddrIndexDataAgent>
  let mockVaultClient: jest.Mocked<VaultClient>

  beforeEach(() => {
    mockAddrIndexDataAgent = createMockInstance(AddrIndexDataAgent)
    mockWeb3Utils = createMockInstance(Web3Utils)
    mockVaultClient = createMockInstance(VaultClient)

    mockAddrIndexDataAgent.findAndUpdateIndex.mockResolvedValue(mockAddressIndex)
    mockWeb3Utils.unlockAccount.mockResolvedValue(undefined)
    mockWeb3Utils.getAccounts.mockResolvedValueOnce([])
    mockVaultClient.readKVSecret.mockResolvedValue({ data: mnemonicData })
    mockVaultClient.isAvailable.mockReturnValue(true)

    signer = new OneTimeSigner(mockWeb3 as any, mockWeb3Utils, mockAddrIndexDataAgent, mockVaultClient, undefined)
  })

  describe('generateOneTimeKey', () => {
    it('should generate a new key successfully', async () => {
      mockWeb3Utils.importRawKey.mockResolvedValueOnce(newAddress)

      const address = await signer.generateOnetimeKey()

      expect(mockWeb3Utils.getAccounts).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.importRawKey).toHaveBeenCalledTimes(1)
      expect(address).toEqual(newAddress)
    })

    it('should return an new account if one already exists (avoid reusing accounts)', async () => {
      const existingAddress = '0x3da12644DE159Dd8396a03A715d8c4f8e9FcedFD'

      mockAddrIndexDataAgent.findAndUpdateIndex.mockReset()
      mockAddrIndexDataAgent.findAndUpdateIndex.mockResolvedValueOnce(mockAddressIndex)
      mockAddrIndexDataAgent.findAndUpdateIndex.mockResolvedValueOnce(mockAddressIndexNext)

      mockWeb3Utils.getAccounts.mockReset()
      mockWeb3Utils.getAccounts.mockResolvedValue([existingAddress])

      mockWeb3Utils.importRawKey.mockResolvedValueOnce(newAddress)

      const address = await signer.generateOnetimeKey()

      expect(mockWeb3Utils.getAccounts).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.importRawKey).toHaveBeenCalledTimes(1)
      expect(address).toEqual(newAddress)
    })
  })

  describe('postTransaction', () => {
    it('should post a transaction successfully', async () => {
      const promiEvent = getNewPromiEventWithReceipt(sampleReceiptWithStatusTrue)
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)

      const txHashResult = await signer.postTransaction(mockPrivateTxRequest)

      // Expected calls before sending transaction
      expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)

      // Waiting for transaction receipt
      await sleep(TIME_INTERVAL_MS)
      await sleep(TIME_INTERVAL_MS)

      // Expected values after resolved with receipt
      expect(txHashResult).toEqual(sampleReceiptWithStatusTrue.transactionHash)
    })

    it('should post a transaction and receive a receipt with status=false', async () => {
      const promiEvent = getNewPromiEventWithReceipt(sampleReceiptWithStatusFalse)
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)

      await expect(signer.postTransaction(mockPrivateTxRequest)).rejects.toThrow('Transaction failed with status=false')

      // Expected calls before sending transaction
      expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if it fails to unlock account', async () => {
      mockWeb3Utils.unlockAccount.mockImplementationOnce(async () => {
        throw new Error(ERROR_MESSAGE)
      })

      try {
        await signer.postTransaction(mockPrivateTxRequest)
        fail('Should throw an exception')
      } catch (error) {
        // Expected calls before sending transaction
        expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
        expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(0)
        expect(error.message).toEqual(ERROR_MESSAGE)
      }
    })

    it('should throw an error for a failed transaction without txhash', async () => {
      const promiEvent = getNewPromiEventErrorWithoutTxHash()
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)

      try {
        await signer.postTransaction(mockPrivateTxRequest)
        fail('Should throw an exception')
      } catch (error) {
        expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
        expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
        // since we have no txhash, we never reach isReceiptRecoverable
        expect(mockWeb3Utils.isReceiptRecoverable).toHaveBeenCalledTimes(0)
        expect(mockWeb3Utils.recoverReceiptOnError).toHaveBeenCalledTimes(0)
        expect(error.message).toEqual(ERROR_MESSAGE)
      }
    })

    it('should throw an error for a failed transaction after failing to recover receipt', async () => {
      const receiptRecoverFailed = 'Failed to recover receipt'
      const promiEvent = getNewPromiEventError()
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)
      mockWeb3Utils.isReceiptRecoverable.mockReturnValue(true)
      const recoverReceiptOnError = { receiptError: new Error(receiptRecoverFailed), receipt: undefined }
      mockWeb3Utils.recoverReceiptOnError.mockResolvedValue(recoverReceiptOnError)

      try {
        await signer.postTransaction(mockPrivateTxRequest)
        fail('Should throw an exception')
      } catch (error) {
        expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
        expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
        // expect that we attempt to recover receipt but still got error
        expect(mockWeb3Utils.isReceiptRecoverable).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.recoverReceiptOnError).toHaveBeenCalledTimes(1)
        expect(error.message).toEqual(receiptRecoverFailed)
      }
    })

    it('should throw an error for a failed transaction with unrecoverable receipt', async () => {
      const promiEvent = getNewPromiEventError()
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)
      mockWeb3Utils.isReceiptRecoverable.mockReturnValue(false)
      try {
        await signer.postTransaction(mockPrivateTxRequest)
        fail('Should throw an exception')
      } catch (error) {
        expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
        expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
        // receipt was not recoverable (notice as recoverReceiptOnError was not called)
        expect(mockWeb3Utils.isReceiptRecoverable).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.recoverReceiptOnError).toHaveBeenCalledTimes(0)
        expect(error.message).toEqual(ERROR_MESSAGE)
      }
    })

    it('should throw an error for a failed transaction with recoverable receipt (status=false)', async () => {
      const promiEvent = getNewPromiEventError()
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)
      mockWeb3Utils.isReceiptRecoverable.mockReturnValue(true)
      const recoverReceiptOnError = { receiptError: undefined, receipt: sampleReceiptWithStatusFalse }
      mockWeb3Utils.recoverReceiptOnError.mockResolvedValue(recoverReceiptOnError)

      await expect(signer.postTransaction(mockPrivateTxRequest)).rejects.toThrow('Transaction failed with status=false')

      expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isReceiptRecoverable).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.recoverReceiptOnError).toHaveBeenCalledTimes(1)
    })

    it('should not throw an error for a failed transaction with recoverable receipt (status=true)', async () => {
      const promiEvent = getNewPromiEventError()
      mockWeb3.eth.sendTransaction.mockReturnValueOnce(promiEvent)
      mockWeb3Utils.isReceiptRecoverable.mockReturnValue(true)
      const recoverReceiptOnError = { receiptError: undefined, receipt: sampleReceiptWithStatusTrue }
      mockWeb3Utils.recoverReceiptOnError.mockResolvedValue(recoverReceiptOnError)

      await signer.postTransaction(mockPrivateTxRequest)

      expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.unlockAccount).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.sendTransaction).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.isReceiptRecoverable).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.recoverReceiptOnError).toHaveBeenCalledTimes(1)
    })
  })
})
