import 'reflect-metadata'
import { createMockInstance } from 'jest-create-mock-instance'

import { buildFakeLetterOfCreditBase } from '@komgo/types'

import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents'

import SignerClient from '../../common/SignerClient'

import { ILetterOfCreditTransactionManager } from './ILetterOfCreditTransactionManager'
import { LetterOfCreditTransactionManager } from './LetterOfCreditTransactionManager'
import { LetterOfCreditContract } from './LetterOfCreditContract'

jest.mock('../../common/HashFunctions.ts', () => ({
  hashMessageWithCallData: jest.fn(() => '0x12345'),
  HashMetaDomain: jest.fn(() => '0x123'),
  toDecimal: jest.fn(() => 38),
  hashMessageWithNonce: jest.fn(() => '0x123'),
  soliditySha3: jest.fn(() => '0x12345')
}))

jest.mock('ethereumjs-util', () => {
  return {
    ethUtil: {
      fromRpcSig() {
        return sampleSignature
      }
    }
  }
})

const sampleSignature = {
  v: '0x26',
  r: '0xe448b291661c63d8add23a8be2eb726e92ace5c100e902ee75a6396f8df8d221',
  s: '0x197fb2e88dc2d4e8f606faf6abdb8012d21b024939756ceaf2d39b4bef619fa4'
}

class MockContract {
  deploy() {
    return {
      encodeABI: jest.fn(() => 'encodedData')
    }
  }
}

const signerClientMock = createMockInstance(SignerClient)
const letterOfCreditContractMock = createMockInstance(LetterOfCreditContract)

letterOfCreditContractMock.getHashedMessageWithCallDataFor.mockImplementation(() => Promise.resolve('0x0'))
letterOfCreditContractMock.getEncodedDataFromSignatureFor.mockImplementation(() => Promise.resolve('0x0'))
letterOfCreditContractMock.instance.mockImplementation(() => new MockContract())
letterOfCreditContractMock.at.mockImplementation(() => new MockContract())
letterOfCreditContractMock.getSignatureParameters.mockImplementation(() => Promise.resolve(sampleSignature) as any)

const letterOfCreditCacheDataAgentMock: ILetterOfCreditDataAgent = {
  get: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  getByContractAddress: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  getNonce: jest.fn(),
  getByTransactionHash: jest.fn()
}

const txHash = '0x12345'

const key = '0x123'

const postTxResult = {
  data: txHash
}

const genericError = new Error('test')

const companyServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

const setupSignerMock = () => {
  signerClientMock.postTransaction.mockResolvedValue(postTxResult)
  signerClientMock.getKey.mockImplementation(() =>
    Promise.resolve({
      data: key
    })
  )
  signerClientMock.sign.mockImplementation(() =>
    Promise.resolve({
      data: key
    })
  )
}

describe('LetterOfCreditTransactionManager', async () => {
  let txManager: ILetterOfCreditTransactionManager
  let sampleLetterOfCredit

  beforeEach(() => {
    signerClientMock.getKey.mockReset()
    signerClientMock.postTransaction.mockReset()
    setupSignerMock()
    sampleLetterOfCredit = buildFakeLetterOfCreditBase()
    txManager = new LetterOfCreditTransactionManager(
      signerClientMock,
      '0x123',
      'applicantId',
      letterOfCreditContractMock,
      letterOfCreditCacheDataAgentMock,
      companyServiceMock
    )
    companyServiceMock.getNodeKeys = jest.fn().mockImplementationOnce(() => ['0x11111111', '0x2222222'])
  })

  describe('deploy', () => {
    it('should return a tx hash after successfully deploying a new LC', async () => {
      const result = await txManager.deploy(sampleLetterOfCredit)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual(txHash)
    })

    it('Should add privateFor with constellation keys of the parties', async () => {
      const result = await txManager.deploy(sampleLetterOfCredit)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith({
        from: key,
        value: '0x00',
        data: 'encodedData',
        privateFor: ['0x11111111', '0x2222222']
      })
      expect(result).toEqual(txHash)
    })

    it('should throw if getKey throws', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })

      expect(txManager.deploy(sampleLetterOfCredit)).rejects.toBeDefined()
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(0)
    })

    it('should throw if postTransaction throws', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })

      await expect(txManager.deploy(sampleLetterOfCredit)).rejects.toBeDefined()

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
    })
  })
})
