import 'reflect-metadata'
import { createMockInstance } from 'jest-create-mock-instance'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'

import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import SignerClient from '../../common/SignerClient'

import { ISBLCTransactionManager } from './ISBLCTransactionManager'
import { SBLCTransactionManager } from './SBLCTransactionManager'
import { SBLCContract } from './SBLCContract'

jest.mock('../../common/HashFunctions.ts', () => ({
  hashMessageWithCallData: jest.fn(() => '0x12345'),
  HashMetaDomain: jest.fn(() => '0x123'),
  toDecimal: jest.fn(() => 38),
  hashMessageWithNonce: jest.fn(() => '0x123')
}))

const sampleSignature = {
  v: '0x26',
  r: '0xe448b291661c63d8add23a8be2eb726e92ace5c100e902ee75a6396f8df8d221',
  s: '0x197fb2e88dc2d4e8f606faf6abdb8012d21b024939756ceaf2d39b4bef619fa4'
}

jest.mock('ethereumjs-util', () => {
  return {
    ethUtil: {
      fromRpcSig() {
        return sampleSignature
      }
    }
  }
})

class MockContract {
  deploy() {
    return {
      encodeABI: jest.fn(() => 'encodedData')
    }
  }
}

const signerClientMock = createMockInstance(SignerClient)
const sblcContractMock = createMockInstance(SBLCContract)
sblcContractMock.instance.mockImplementation(() => new MockContract())
sblcContractMock.at.mockImplementation(() => new MockContract())
sblcContractMock.getHashedMessageWithCallDataFor.mockImplementation(() => Promise.resolve('0x0'))
sblcContractMock.getEncodedDataFromSignatureFor.mockImplementation(() => Promise.resolve('0x0'))
sblcContractMock.getSignatureParameters.mockImplementation(() => Promise.resolve(sampleSignature))

const sblcCacheDataAgentMock: ISBLCDataAgent = {
  get: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  getByContractAddress: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  getNonce: jest.fn()
}

const txHash = '0x12345'

const key = '0x123'

const sampleAddress = '0x8304cb99e989ee34af465db1cf15e369d8402870'

const transactionObject = {
  from: key,
  value: '0x00',
  data: '0x0',
  to: sampleAddress,
  privateFor: ['0x11111111', '0x2222222']
}

const postTxResult = {
  data: txHash
}

const sblcMock = {
  applicantId: 'applicantId',
  beneficiaryId: 'beneficiaryId',
  issuingBankId: 'issuingBankId',
  beneficiaryBankId: 'beneficiaryBankId',
  nonce: 1
}

const sblcParams = {
  buyerId: 'buyer',
  sellerId: 'seller',
  issuingBankId: 'bank1',
  tradeData: 'trade',
  applicantId: 'applicantId',
  beneficiaryId: 'beneficiaryId'
}

const genericError = new Error('test')

const companyServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

const setupSignerMock = () => {
  signerClientMock.postTransaction.mockImplementation(() => postTxResult)
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

describe('SBLCTransactionManager', async () => {
  let txManager: ISBLCTransactionManager

  beforeEach(() => {
    signerClientMock.getKey.mockReset()
    signerClientMock.postTransaction.mockReset()
    setupSignerMock()
    txManager = new SBLCTransactionManager(
      signerClientMock,
      '0x123',
      'applicantId',
      sblcContractMock,
      sblcCacheDataAgentMock,
      companyServiceMock
    )
    companyServiceMock.getNodeKeys = jest.fn().mockImplementationOnce(() => ['0x11111111', '0x2222222'])
  })

  describe('deploy', () => {
    it('should return a tx hash after successfully deploying a new LC', async () => {
      const result = await txManager.deploy(sblcParams)
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual(txHash)
    })

    it('Should add privateFor with constellation keys of the parties', async () => {
      const result = await txManager.deploy(sblcParams)
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
      expect(txManager.deploy(sblcParams)).rejects.toBeDefined()
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(0)
    })

    it('should throw if postTransaction throws', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.deploy(sblcParams)).rejects.toBeDefined()
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
    })
  })

  describe('issue', () => {
    const sampleDocumentHash = '0x0'
    const sampleDocReference = 'ref-1234'
    const issuingBankPostalAddress = 'address'

    beforeEach(() => {
      sblcCacheDataAgentMock.get = jest.fn().mockImplementationOnce(() => sblcMock)
      sblcCacheDataAgentMock.getByContractAddress = jest.fn().mockImplementationOnce(() => sblcMock)
    })

    it('should return a tx hash after issue an SBLC', async () => {
      setupSignerMock()
      const result = await txManager.issue(
        sampleAddress,
        sampleDocumentHash,
        sampleDocReference,
        issuingBankPostalAddress
      )

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(
        txManager.issue(sampleAddress, sampleDocumentHash, sampleDocReference, issuingBankPostalAddress)
      ).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)

      await expect(
        txManager.issue(sampleAddress, sampleDocumentHash, sampleDocReference, issuingBankPostalAddress)
      ).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)

      await expect(
        txManager.issue(sampleAddress, sampleDocumentHash, sampleDocReference, issuingBankPostalAddress)
      ).rejects.toBeDefined()
    })
  })

  describe('requestReject', () => {
    const comments = '0x0'

    beforeEach(() => {
      sblcCacheDataAgentMock.get = jest.fn().mockImplementationOnce(() => sblcMock)
      sblcCacheDataAgentMock.getByContractAddress = jest.fn().mockImplementationOnce(() => sblcMock)
    })

    it('should return a tx hash after requestReject an SBLC', async () => {
      setupSignerMock()

      const result = await txManager.requestReject(sampleAddress, comments)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })

      await expect(txManager.requestReject(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })

      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.requestReject(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })

      await expect(txManager.requestReject(sampleAddress, comments)).rejects.toBeDefined()
    })
  })
})
