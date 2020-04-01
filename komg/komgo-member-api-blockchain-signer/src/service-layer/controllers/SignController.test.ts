import 'jest'
import 'reflect-metadata'

import { ErrorCode } from '@komgo/error-utilities'
import { createMockInstance } from 'jest-create-mock-instance'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import { IETHKeyData } from '../../business-layer/key-management/models/IETHKeyData'
import OneTimeSigner from '../../business-layer/one-time-key/OneTimeSigner'
import { IRawPrivateTx, IRawTx } from '../../business-layer/transactions/models'
import TransactionManager from '../../business-layer/transactions/TransactionManager'
import Web3Utils from '../../business-layer/transactions/Web3Utils'
import TransactionDataAgent from '../../data-layer/data-agents/TransactionDataAgent'
import { ITransaction } from '../../data-layer/models/transaction'
import { TX_ID } from '../../utils/test-data'
import {
  IEncryptRequest,
  IPayloadRequest,
  PostRawPrivateTransactionRequest,
  PostRawTransactionRequest
} from '../request/signer'
import { MICROSERVICE_NAME as API_ORIGIN } from '../responses'
import { ITransactionStatus } from '../responses/transactions/ITransactionStatus'
import { SignController } from './SignController'

process.env.CONTAINER_HOSTNAME = 'api-blockchain-signer'

const ERROR_500_MESSAGE = 'Internal Server Error'

const receiverEthData: IETHKeyData = {
  address: '0xC7ed7D093a81f7Fd2860f9e36A4bB88Efca94A47',
  privateKey: '0x539e6d9c6df968466ffda0ff94ac5e053b29226ab380787b433d9849e0fecb88',
  publicKey: '03e607fea5e376d6148fcaab651dc7eacb436283f595eac185d1bf34f20d736f72',
  publicKeyCompressed: ''
}

const companyEthData: IETHKeyData = {
  address: '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e',
  privateKey: '0x319f0c0aa7d12b074b67a63580518611374735e902113ae36f7a805085d4b93c',
  publicKey: '022a48ca7bf0f51e8c5be7f564c1e339bccdc90b656ffd44db7c00d8e7bd5c1eb1',
  publicKeyCompressed: ''
}

const txContext = {
  key: 'value'
}

const rawTxRequest: PostRawTransactionRequest = {
  id: TX_ID,
  to: receiverEthData.address,
  value: '0x0',
  data: 'someEncodedData',
  requestOrigin: 'requestOrigin',
  context: txContext
}

const oneTimeAddress = '0xone-time-address'

const rawPrivateTxRequest: PostRawPrivateTransactionRequest = {
  id: TX_ID,
  to: receiverEthData.address,
  data: 'someEncodedData',
  privateFor: ['0x0'],
  requestOrigin: 'requestOrigin',
  context: txContext
}

const rawTransaction: IRawTx = {
  from: receiverEthData.address,
  to: receiverEthData.address,
  value: '0x0',
  gas: 0,
  gasPrice: '0x0',
  data: 'someEncodedData'
}

const rawPrivateTransaction: IRawPrivateTx = {
  from: receiverEthData.address,
  to: receiverEthData.address,
  value: '0x0',
  gas: 0,
  gasPrice: '0x0',
  data: 'someEncodedData',
  privateFor: []
}

const sampleTx: ITransaction = {
  id: '5c8a73c9b1a4f00fd393b943',
  from: companyEthData.address,
  body: {
    from: companyEthData.address,
    to: receiverEthData.address,
    value: '0x0',
    gas: 314159,
    gasLimit: 314159,
    gasPrice: 0,
    data: 'txData'
  },
  hash: '0xae0f3a6c4c5f7cf9b9e7a0af000a1dbdcede524417bd0f2a6f6d8711d178c199',
  status: 'pending',
  mined: false,
  requestOrigin: 'requestOrigin',
  nonce: 0,
  receipt: undefined,
  attempts: 0
}

const payloadRequest: IPayloadRequest = {
  payload: 'payloadMessage'
}

const encryptRequest: IEncryptRequest = {
  payload: payloadRequest.payload,
  publicKey: companyEthData.publicKey
}

describe('SignController', () => {
  let controller: SignController
  let mockCompanyKeyProvider: jest.Mocked<CompanyKeyProvider>
  let mockTransactionManager: jest.Mocked<TransactionManager>
  let mockTransactionDataAgent: jest.Mocked<TransactionDataAgent>
  let mockWeb3Utils: jest.Mocked<Web3Utils>
  let mockOneTimeSigner: jest.Mocked<OneTimeSigner>

  beforeEach(() => {
    mockCompanyKeyProvider = createMockInstance(CompanyKeyProvider)
    mockTransactionManager = createMockInstance(TransactionManager)
    mockTransactionDataAgent = createMockInstance(TransactionDataAgent)
    mockWeb3Utils = createMockInstance(Web3Utils)
    mockOneTimeSigner = createMockInstance(OneTimeSigner)

    mockCompanyKeyProvider.getETHKey.mockResolvedValue(companyEthData)

    mockTransactionManager.persistNewTx.mockResolvedValue(sampleTx)

    mockTransactionManager.sendPublicTx.mockResolvedValue(undefined)
    mockTransactionManager.sendPrivateTx.mockResolvedValue(undefined)
    mockTransactionDataAgent.getTransaction.mockResolvedValue(sampleTx)

    mockWeb3Utils.buildRawTx.mockResolvedValue(rawTransaction)
    mockWeb3Utils.buildRawPrivateTx.mockResolvedValue(rawPrivateTransaction)

    mockOneTimeSigner.generateOnetimeKey.mockResolvedValue(oneTimeAddress)

    controller = new SignController(
      mockCompanyKeyProvider,
      mockTransactionManager,
      mockWeb3Utils,
      mockOneTimeSigner,
      mockTransactionDataAgent
    )
  })

  describe('getTxStatus', () => {
    it('should successfully fetch status for an existing tx', async () => {
      const result: ITransactionStatus = await controller.txStatus(sampleTx.id)

      expect(mockTransactionDataAgent.getTransaction).toHaveBeenCalledTimes(1)
      expect(mockTransactionDataAgent.getTransaction).toBeCalledWith(sampleTx.id)

      expect(result).toEqual({
        hash: sampleTx.hash,
        status: sampleTx.status
      })
    })

    it('should fail with 404 if transaction is not found', async () => {
      mockTransactionDataAgent.getTransaction.mockImplementation(() => {
        return null
      })

      const txHash = 'non-existing-tx-hash'
      try {
        await controller.txStatus(txHash)
        fail('Expected to have thrown')
      } catch (err) {
        expect(mockTransactionDataAgent.getTransaction).toHaveBeenCalledTimes(1)
        expect(mockTransactionDataAgent.getTransaction).toBeCalledWith(txHash)
        expect(err.status).toBe(404)
      }
    })
  })

  describe('sendTx', () => {
    it('should take basic tx request, build, persist it successfully', async () => {
      const resultTxId = await controller.sendTx(rawTxRequest)

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockCompanyKeyProvider.getETHKey).toBeCalledWith()

      expect(mockWeb3Utils.buildRawTx).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.buildRawTx).toBeCalledWith(
        companyEthData.address,
        rawTxRequest.to,
        rawTxRequest.data,
        rawTxRequest.value,
        rawTxRequest.gas
      )

      expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.persistNewTx).toBeCalledWith(
        rawTransaction,
        TX_ID,
        rawPrivateTxRequest.requestOrigin,
        txContext
      )
      // KOMGO-4268 - controller no longer triggers sendPublicTx
      // this is now handled by TransactionSendService
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
      expect(resultTxId).toBe(sampleTx.id)
    })

    it('should fail with status 422 if requestOrigin contain other characters than alphanumeric', async () => {
      try {
        await controller.sendTx({ ...rawTxRequest, requestOrigin: '@specialCharacter_56' })
        fail('Expected a validation exception to be thrown')
      } catch (error) {
        const errorObject = {
          message: 'Invalid request',
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent,
          fields: {
            requestOrigin: ['requestOrigin must contain only letters and numbers']
          }
        }
        expect(error.status).toBe(422)
        expect(error.message).toBe(errorObject.message)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 500 if fails to retrieve key data', async () => {
      mockCompanyKeyProvider.getETHKey.mockRejectedValueOnce(new Error())

      try {
        await controller.sendTx(rawTxRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)

        expect(mockWeb3Utils.buildRawTx).toHaveBeenCalledTimes(0)
        expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(0)
        expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 500 if fails to build raw transaction', async () => {
      mockWeb3Utils.buildRawTx.mockRejectedValueOnce(new Error())

      try {
        await controller.sendTx(rawTxRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.buildRawTx).toHaveBeenCalledTimes(1)
        expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(0)
        expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 500 if fails to persist transaction', async () => {
      mockTransactionManager.persistNewTx.mockRejectedValueOnce(new Error())

      try {
        await controller.sendTx(rawTxRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(mockWeb3Utils.buildRawTx).toHaveBeenCalledTimes(1)
        expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(1)
        expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should not fail if sendPublicTx returns an error', async () => {
      mockTransactionManager.sendPublicTx.mockRejectedValueOnce(new Error())

      const resultTxId = await controller.sendTx(rawTxRequest)

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.buildRawTx).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(1)
      // KOMGO-4268 - controller no longer triggers sendPublicTx
      // this is now handled by TransactionSendService
      expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
      expect(resultTxId).toBe(sampleTx.id)
    })
  })

  describe('sendPrivateTx', () => {
    it('should take basic tx request, build, persist and post it successfully', async () => {
      const resultTxId = await controller.sendPrivateTx(rawPrivateTxRequest)

      expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
      expect(mockWeb3Utils.buildRawPrivateTx).toBeCalledWith(
        oneTimeAddress,
        rawPrivateTxRequest.to,
        rawPrivateTxRequest.data,
        rawPrivateTxRequest.privateFor,
        undefined,
        rawPrivateTxRequest.gas
      )
      expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.persistNewTx).toBeCalledWith(
        rawPrivateTransaction,
        TX_ID,
        rawPrivateTxRequest.requestOrigin,
        rawPrivateTxRequest.context
      )
      // KOMGO-4268 - controller no longer triggers sendPublicTx
      // this is now handled by TransactionSendService
      expect(mockTransactionManager.sendPrivateTx).toHaveBeenCalledTimes(0)

      expect(resultTxId).toBe(sampleTx.id)
    })

    it('should fail with status 422 if requestOrigin contain other characters than alphanumeric', async () => {
      try {
        await controller.sendPrivateTx({ ...rawPrivateTxRequest, requestOrigin: '@specialCharacter_56' })
        fail('Expected a validation exception to be thrown')
      } catch (error) {
        const errorObject = {
          message: 'Invalid request',
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent,
          fields: {
            requestOrigin: ['requestOrigin must contain only letters and numbers']
          }
        }
        expect(error.status).toBe(422)
        expect(error.message).toBe(errorObject.message)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 422 if privateFor array is empty', async () => {
      try {
        await controller.sendPrivateTx({ ...rawPrivateTxRequest, privateFor: [] })
        fail('Expected a validation exception to be thrown')
      } catch (error) {
        const errorObject = {
          message: 'Invalid request',
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent,
          fields: {
            privateFor: ['privateFor should not be empty']
          }
        }
        expect(error.status).toBe(422)
        expect(error.message).toBe(errorObject.message)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 500 if fails to build raw transaction', async () => {
      mockWeb3Utils.buildRawPrivateTx.mockRejectedValueOnce(new Error())

      try {
        await controller.sendPrivateTx(rawPrivateTxRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
        expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(0)
        expect(mockTransactionManager.sendPrivateTx).toHaveBeenCalledTimes(0)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 500 if fails to persist transaction', async () => {
      mockTransactionManager.persistNewTx.mockRejectedValueOnce(new Error())

      try {
        await controller.sendPrivateTx(rawPrivateTxRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
        expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(1)
        expect(mockTransactionManager.sendPublicTx).toHaveBeenCalledTimes(0)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should not fail if sendPublicTx returns an error', async () => {
      mockTransactionManager.sendPublicTx.mockRejectedValueOnce(new Error())

      const resultTxId = await controller.sendPrivateTx(rawPrivateTxRequest)

      expect(mockWeb3Utils.buildRawPrivateTx).toHaveBeenCalledTimes(1)
      expect(mockTransactionManager.persistNewTx).toHaveBeenCalledTimes(1)
      // KOMGO-4268 - controller no longer triggers sendPublicTx
      // this is now handled by TransactionSendService
      expect(mockTransactionManager.sendPrivateTx).toHaveBeenCalledTimes(0)
      expect(resultTxId).toBe(sampleTx.id)
    })
  })

  describe('sign', () => {
    it('should sign a message successfully', async () => {
      const signature = await controller.sign(payloadRequest)

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(signature).toBeDefined()
    })

    it('should fail with status 500 if unable to retrieve key data', async () => {
      mockCompanyKeyProvider.getETHKey.mockRejectedValueOnce(new Error())

      try {
        await controller.sign(payloadRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })
  })

  describe('simple sign', () => {
    it('should simple sign a message successfully', async () => {
      const signature = await controller.simpleSign({
        payload: '88c0ec1d0bcedce9b7e9ca527a4ff8b2e5dd45ac08f3fd99c55da2df9aa052dd'
      })

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(signature).toBeDefined()
    })

    it('should fail with status 500 if unable to retrieve key data', async () => {
      mockCompanyKeyProvider.getETHKey.mockRejectedValueOnce(new Error())

      try {
        await controller.simpleSign(payloadRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail with status 500 if payload is not a keccak hash', async () => {
      try {
        await controller.simpleSign(payloadRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })
  })

  describe('encrypt and decrypt', () => {
    it('should encrypt & decrypt successfully', async () => {
      const encryptedMessage = await controller.encrypt(encryptRequest)
      const decryptedMessage = await controller.decrypt({ payload: encryptedMessage })

      expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
      expect(decryptedMessage).toEqual(payloadRequest.payload)
    })

    it('should fail to decrypt with status 500 if unable to retrieve key data', async () => {
      mockCompanyKeyProvider.getETHKey.mockRejectedValueOnce(new Error())

      try {
        await controller.decrypt(payloadRequest)
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail to decrypt with status 500 if the public key used to encrypt is not our own', async () => {
      const encryptedMessage = await controller.encrypt({ ...encryptRequest, publicKey: receiverEthData.publicKey })

      try {
        await controller.decrypt({ payload: encryptedMessage })
        fail('Expected a server error exception')
      } catch (error) {
        const errorObject = {
          message: ERROR_500_MESSAGE,
          origin: API_ORIGIN,
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(mockCompanyKeyProvider.getETHKey).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })

    it('should fail to encrypt with status 400 if the public key is not a secp256k1 point', async () => {
      try {
        await controller.encrypt({ ...encryptRequest, publicKey: 'badPublicKey' })
        fail('Expected a validation exception')
      } catch (error) {
        const errorObject = {
          message: 'Failed to encrypt',
          origin: API_ORIGIN,
          fields: {
            publicKey: ['Invalid public key']
          },
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(error.status).toEqual(400)
        expect(error.message).toBe(errorObject.message)
        expect(error.errorObject).toEqual(errorObject)
      }
    })
  })

  describe('verify', () => {
    it('should verify signature against encrypted message successfully', async () => {
      const encryptedMessage = await controller.encrypt(encryptRequest)
      const signature = await controller.sign({ payload: encryptedMessage })

      const result = await controller.verify({ payload: encryptedMessage, signature, address: companyEthData.address })
      expect(result.isValid).toEqual(true)
    })

    it('should verify signature against any message successfully', async () => {
      const message = 'nonEncryptedMessage'
      const signature = await controller.sign({ payload: message })

      const result = await controller.verify({
        payload: message,
        signature,
        address: companyEthData.address
      })

      expect(result.isValid).toEqual(true)
    })

    it('should fail to verify if address is wrong', async () => {
      const encryptedMessage = await controller.encrypt(encryptRequest)
      const signature = await controller.sign({ payload: encryptedMessage })

      const result = await controller.verify({ payload: encryptedMessage, signature, address: receiverEthData.address })

      expect(result.isValid).toEqual(false)
    })

    it('should fail to verify with status 400 if signature is bad', async () => {
      const encrypted = await controller.encrypt(encryptRequest)
      const badSignature =
        '0x2ccc99e96dc08f6c323e086a45581014265abafe835222a9de9dfce26910336c6f001d98def8944baf8e9d4d18d3c192ee923847884881da7f9079b4c504ff471b'

      try {
        await controller.verify({ payload: encrypted, signature: badSignature, address: companyEthData.address })
        fail('Expected a validation exception')
      } catch (error) {
        const errorObject = {
          message: 'Failed to verify',
          origin: API_ORIGIN,
          fields: {
            signature: ['Invalid signature']
          },
          errorCode: ErrorCode.ValidationHttpContent
        }

        expect(error.status).toEqual(400)
        expect(error.message).toBe(errorObject.message)
        expect(error.errorObject).toEqual(errorObject)
      }
    })
  })
})
