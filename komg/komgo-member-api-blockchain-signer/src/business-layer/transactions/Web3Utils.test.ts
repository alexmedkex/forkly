import 'jest'
import 'reflect-metadata'

import { IRawPrivateTx, IRawTx } from './models'
import Web3Utils, { WEB3_ERROR_MESSAGES, onWeb3Error } from './Web3Utils'
import RetryableError from '../../utils/RetryableError'

const RECEIVER_ACCOUNT = '0xC7ed7D093a81f7Fd2860f9e36A4bB88Efca94A47'
const PASSPHRASE = 'passphrase'

const mockWeb3 = {
  eth: {
    getAccounts: jest.fn(),
    getTransactionCount: jest.fn(),
    sendSignedTransaction: jest.fn(),
    getTransaction: jest.fn(),
    getTransactionReceipt: jest.fn(),
    personal: {
      unlockAccount: jest.fn(),
      importRawKey: jest.fn()
    }
  },
  utils: {
    isAddress: jest.fn()
  }
}

const companyEthData = {
  address: '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e',
  privateKey: '0x319f0c0aa7d12b074b67a63580518611374735e902113ae36f7a805085d4b93c'
}

const sampleTxHash = '0xtransactionHash'

const sampleReceipt = {
  transactionHash: sampleTxHash,
  blockNumber: 666,
  status: true
}

const sampleTx = {
  id: 'txId',
  from: companyEthData.address,
  body: {
    from: companyEthData.address,
    to: RECEIVER_ACCOUNT,
    value: '0x0',
    gas: 314159,
    gasLimit: 314159,
    gasPrice: '0x0',
    data: 'txData',
    blockNumber: 666
  },
  status: 'pending',
  requestOrigin: 'requestOrigin',
  attempts: 0
}

const TX_GAS_LIMIT = 20000000

describe('Web3Utils', () => {
  const web3Utils = new Web3Utils(mockWeb3 as any, TX_GAS_LIMIT)

  beforeEach(() => {
    jest.resetAllMocks()
    mockWeb3.utils.isAddress.mockResolvedValue(true)
  })

  describe('getAccounts', () => {
    it('should get web3 accounts', async () => {
      await web3Utils.getAccounts()

      expect(mockWeb3.eth.getAccounts).toHaveBeenCalledTimes(1)
    })

    it('should re-throw getAccounts error', async () => {
      const error = new Error('error')
      mockWeb3.eth.getAccounts.mockRejectedValueOnce(error)

      const call = web3Utils.getAccounts()

      await expect(call).rejects.toThrowError('error')
    })
  })

  describe('importRawKey', () => {
    it('should call web3 importRawKey', async () => {
      const privateKey = 'privateKey'
      const passphrase = 'passphrase'
      await web3Utils.importRawKey(privateKey, passphrase)

      expect(mockWeb3.eth.personal.importRawKey).toHaveBeenCalledTimes(1)
    })

    it('should re-throw getAccounts error', async () => {
      const privateKey = 'privateKey'
      const passphrase = 'passphrase'

      const error = new Error('error')
      mockWeb3.eth.personal.importRawKey.mockRejectedValueOnce(error)

      const call = web3Utils.importRawKey(privateKey, passphrase)

      await expect(call).rejects.toThrowError('error')
    })
  })

  describe('unlockAccount', () => {
    it('should unlock web3 account', async () => {
      process.env.PASSPHRASE = PASSPHRASE
      await web3Utils.unlockAccount(RECEIVER_ACCOUNT)

      expect(mockWeb3.eth.personal.unlockAccount).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.personal.unlockAccount).toBeCalledWith(RECEIVER_ACCOUNT, PASSPHRASE, 600)
    })

    it('should re-throw unlockAccount error', async () => {
      const error = new Error('error')
      mockWeb3.eth.personal.unlockAccount.mockRejectedValueOnce(error)

      const call = web3Utils.unlockAccount(RECEIVER_ACCOUNT)

      await expect(call).rejects.toThrowError('error')
    })
  })

  describe('buildRawTx', () => {
    it('should build a raw transaction successfully', async () => {
      const from = companyEthData.address
      const to = RECEIVER_ACCOUNT
      const data = sampleTx.body.data
      const value = sampleTx.body.value

      const result = await web3Utils.buildRawTx(from, to, data, value)

      const expectedTx: IRawTx = {
        from,
        to,
        value,
        gas: TX_GAS_LIMIT,
        gasPrice: '0x0',
        data
      }

      expect(result).toEqual(expectedTx)
    })

    it('should use provided gas limit', async () => {
      const from = companyEthData.address
      const to = RECEIVER_ACCOUNT
      const data = sampleTx.body.data
      const value = sampleTx.body.value
      const gas = 1234

      const result = await web3Utils.buildRawTx(from, to, data, value, gas)

      const expectedTx: IRawTx = {
        from,
        to,
        value,
        gas,
        gasPrice: '0x0',
        data
      }

      expect(result).toEqual(expectedTx)
    })

    it('should fail if `from` is not an address', async () => {
      const from = 'this is not an address'
      const to = RECEIVER_ACCOUNT
      const data = sampleTx.body.data
      const value = sampleTx.body.value
      const gas = 1234

      mockWeb3.utils.isAddress.mockReset()
      mockWeb3.utils.isAddress.mockReturnValue(false)

      await expect(web3Utils.buildRawTx(from, to, data, value, gas)).rejects.toThrow(
        `Incorrect address for field [from]: ${from}`
      )
    })

    it('should fail if `to` is not an address', async () => {
      const from = companyEthData.address
      const to = 'this is not an address'
      const data = sampleTx.body.data
      const value = sampleTx.body.value
      const gas = 1234

      mockWeb3.utils.isAddress.mockReset()
      mockWeb3.utils.isAddress.mockReturnValueOnce(true)
      mockWeb3.utils.isAddress.mockReturnValueOnce(false)

      await expect(web3Utils.buildRawTx(from, to, data, value, gas)).rejects.toThrow(
        `Incorrect address for field [to]: ${to}`
      )
    })

    it('should succeed if `to` is not defined (for deployment contracts)', async () => {
      const from = companyEthData.address
      const to = undefined
      const data = sampleTx.body.data
      const value = sampleTx.body.value
      const gas = 1234

      const result = await web3Utils.buildRawTx(from, to, data, value, gas)

      const expectedTx: IRawTx = {
        from,
        to,
        value,
        gas,
        gasPrice: '0x0',
        data
      }

      expect(result).toEqual(expectedTx)
    })
  })

  describe('buildRawPrivateTx', () => {
    it('should build a raw private transaction successfully', async () => {
      const from = companyEthData.address
      const to = RECEIVER_ACCOUNT
      const data = sampleTx.body.data
      const privateFor = ['0x123', '0x456']

      const result = await web3Utils.buildRawPrivateTx(from, to, data, privateFor)

      const expectedTx: IRawPrivateTx = {
        from,
        to,
        value: undefined,
        gas: TX_GAS_LIMIT,
        gasPrice: '0x0',
        nonce: 0,
        data,
        privateFor
      }

      expect(result).toEqual(expectedTx)
    })
  })

  describe('isTxInBlock', () => {
    it('should return true if transaction is contained in block', async () => {
      mockWeb3.eth.getTransaction.mockResolvedValueOnce(sampleTx.body)

      const result = await web3Utils.isTxInBlock(sampleTxHash)

      expect(result).toBe(true)
    })

    it('should return false if transaction hash is not defined', async () => {
      const result = await web3Utils.isTxInBlock(undefined)
      expect(result).toBe(false)
    })

    it('should return false if returned transaction is null', async () => {
      mockWeb3.eth.getTransaction.mockResolvedValueOnce(null)

      const result = await web3Utils.isTxInBlock(sampleTxHash)

      expect(result).toBe(false)
    })

    it('should return false if txHash input is undefined', async () => {
      const result = await web3Utils.isTxInBlock(undefined)

      expect(result).toBe(false)
    })
  })

  describe('getTxReceipt', () => {
    it('should return the transaction receipt', async () => {
      mockWeb3.eth.getTransactionReceipt.mockResolvedValueOnce(sampleReceipt)

      const result = await web3Utils.getTxReceipt(sampleTxHash)

      expect(result).toBe(sampleReceipt)
    })
  })

  describe('recoverReceiptOnError', () => {
    it('should throw error if txHash is undefined', async () => {
      await expect(web3Utils.recoverReceiptOnError(undefined, undefined)).rejects.toThrowError(
        'Unable to retrieve transaction receipt: no transaction hash'
      )
    })

    it('should recover receipt successfully', async () => {
      const txHash = 'txHash'
      const originalError = new Error('some previous error')
      const receipt = 'this is a receipt'
      mockWeb3.eth.getTransactionReceipt.mockReturnValue(receipt)
      const result = await web3Utils.recoverReceiptOnError(txHash, originalError)

      expect(result).toEqual({ receiptError: undefined, receipt })
    })

    it('should fail to recover receipt', async () => {
      const txHash = 'txHash'
      const originalError = new Error('some previous error')
      const receiptError = new Error('Failed getting transaction receipt: ' + originalError.message)
      const receipt = undefined
      mockWeb3.eth.getTransactionReceipt.mockResolvedValue(receipt)
      const result = await web3Utils.recoverReceiptOnError(txHash, originalError)

      expect(result).toEqual({ receiptError, receipt })
    })
  })

  describe('isReceiptRecoverable', () => {
    it('errors that are recoverable should return true', () => {
      expect(web3Utils.isReceiptRecoverable(new Error(WEB3_ERROR_MESSAGES.InvalidJsonRPC))).toBe(true)
      expect(web3Utils.isReceiptRecoverable(new Error(WEB3_ERROR_MESSAGES.RateLimit))).toBe(true)
      expect(web3Utils.isReceiptRecoverable(new Error(WEB3_ERROR_MESSAGES.NodeTemporarilyUnavailable))).toBe(true)
      expect(web3Utils.isReceiptRecoverable(new Error(WEB3_ERROR_MESSAGES.FailedToCheckForReceipt))).toBe(true)
    })

    it('errors that are not recoverable should return false', () => {
      expect(web3Utils.isReceiptRecoverable(new Error(WEB3_ERROR_MESSAGES.NonceTooLow))).toBe(false)
      expect(web3Utils.isReceiptRecoverable(new Error(WEB3_ERROR_MESSAGES.ContractCodeStorageGasLimit))).toBe(false)
      expect(web3Utils.isReceiptRecoverable(new Error('something else'))).toBe(false)
    })
  })

  describe('onWeb3Error', () => {
    it('errors that are retryable should return true', () => {
      expect(onWeb3Error(new RetryableError('should retry'))).toBe(true)
      expect(onWeb3Error(new Error(WEB3_ERROR_MESSAGES.ContractCodeStorageGasLimit))).toBe(true)
      expect(onWeb3Error(new Error(WEB3_ERROR_MESSAGES.InvalidJsonRPC))).toBe(true)
      expect(onWeb3Error(new Error(WEB3_ERROR_MESSAGES.RateLimit))).toBe(true)
      expect(onWeb3Error(new Error(WEB3_ERROR_MESSAGES.NodeTemporarilyUnavailable))).toBe(true)
      expect(onWeb3Error(new Error(WEB3_ERROR_MESSAGES.FailedToCheckForReceipt))).toBe(true)
    })

    it('errors that are not retryable should return false', () => {
      expect(onWeb3Error(new Error(WEB3_ERROR_MESSAGES.NonceTooLow))).toBe(false)
      expect(onWeb3Error(new Error('something else'))).toBe(false)
    })
  })
})
