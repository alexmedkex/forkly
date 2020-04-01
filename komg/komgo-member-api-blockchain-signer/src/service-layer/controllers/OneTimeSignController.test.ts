import 'jest'
import 'reflect-metadata'

import { ErrorCode } from '@komgo/error-utilities'

import { IPostPrivateTransaction } from '../request/one-time-signer'
import { MICROSERVICE_NAME as API_ORIGIN } from '../responses'

import { OneTimeSignController } from './OneTimeSignController'
import OneTimeSigner from '../../business-layer/one-time-key/OneTimeSigner'
import ContentionManager from '../../business-layer/contention/ContentionManager'

process.env.CONTAINER_HOSTNAME = 'api-blockchain-signer'

const error500Message = 'Internal Server Error'
const sampleTxHash = '0xtransactionHash'

const rawTxRequest: IPostPrivateTransaction = {
  from: '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e',
  data: 'someEncodedData',
  value: '0x0',
  privateFor: []
}

const mockOneTimeSigner = {
  generateOnetimeKey: jest.fn(),
  postTransaction: jest.fn()
}

const mockContentionManager = {
  apply: jest.fn()
}
describe('OneTimeSignController', () => {
  let controller: OneTimeSignController

  beforeEach(() => {
    controller = new OneTimeSignController(
      (mockOneTimeSigner as unknown) as OneTimeSigner,
      (mockContentionManager as unknown) as ContentionManager
    )
    mockContentionManager.apply.mockImplementation(async func => func())
  })

  describe('getKey', () => {
    it('should return a key successfully', async () => {
      mockOneTimeSigner.generateOnetimeKey.mockResolvedValueOnce('publicKey')
      const key = await controller.getKey()

      expect(mockOneTimeSigner.generateOnetimeKey).toHaveBeenCalled()
      expect(key).toEqual('publicKey')
    })

    it('should fail with status 500 if genereteOnetimeKey throws an error', async () => {
      mockOneTimeSigner.generateOnetimeKey.mockImplementation(() => {
        throw new Error()
      })

      try {
        await controller.getKey()
        fail('Should throw an exception')
      } catch (error) {
        const errorObject = {
          message: error500Message,
          origin: API_ORIGIN,
          errorCode: ErrorCode.Configuration
        }

        expect(mockOneTimeSigner.generateOnetimeKey).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })
  })

  describe('postTransaction', () => {
    it('should post a transaction and return a transaction hash successfully', async () => {
      mockOneTimeSigner.postTransaction.mockResolvedValueOnce(sampleTxHash)

      const txHash = await controller.postTransaction(rawTxRequest)

      expect(mockOneTimeSigner.postTransaction).toHaveBeenCalled()
      expect(txHash).toEqual(sampleTxHash)
    })

    it('should fail with status 500 if postTransaction throws an error', async () => {
      mockOneTimeSigner.postTransaction.mockImplementation(() => {
        throw new Error()
      })

      try {
        await controller.postTransaction(rawTxRequest)
        fail('Should throw an exception')
      } catch (error) {
        const errorObject = {
          message: error500Message,
          origin: API_ORIGIN,
          errorCode: ErrorCode.BlockchainTransaction
        }

        expect(mockOneTimeSigner.postTransaction).toHaveBeenCalledTimes(1)
        expect(error.status).toBe(500)
        expect(error.errorObject).toEqual(errorObject)
      }
    })
  })
})
