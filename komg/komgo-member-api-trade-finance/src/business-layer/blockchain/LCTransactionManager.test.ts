import 'reflect-metadata'
import SignerClient from '../common/SignerClient'
import { createMockInstance } from 'jest-create-mock-instance'
import { LCContract } from './LCContract'

jest.mock('../common/HashFunctions.ts', () => ({
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

const txHash = '0x12345'

class MockContract {
  public methods = {
    nonce: jest.fn(() => {
      return {
        call: jest.fn(() => 1)
      }
    }),
    initialise: jest.fn(() => {
      return {
        encodeABI: jest.fn(() => 'encodedData')
      }
    })
  }
  deploy() {
    return {
      encodeABI: jest.fn(() => 'encodedData')
    }
  }
}

const signerClientMock = createMockInstance(SignerClient)
const lcContractMock = createMockInstance(LCContract)
lcContractMock.instance.mockImplementation(() => new MockContract())
lcContractMock.at.mockImplementation(() => new MockContract())
lcContractMock.getHashedMessageWithCallDataFor.mockImplementation(() => Promise.resolve('0x0'))
lcContractMock.getEncodedDataFromSignatureFor.mockImplementation(() => Promise.resolve('0x0'))
lcContractMock.getSignatureParameters.mockImplementation(() => Promise.resolve(sampleSignature))

const postTxResult = {
  data: txHash
}

const lcParams = {
  buyerId: 'buyer',
  sellerId: 'seller',
  issuingBankId: 'bank1',
  tradeData: 'trade',
  applicantId: 'applicantId',
  beneficiaryId: 'beneficiaryId'
}

const key = '0x123'

const sampleAddress = '0x8304cb99e989ee34af465db1cf15e369d8402870'

const transactionObject = {
  from: key,
  value: '0x00',
  data: '0x0',
  to: sampleAddress,
  privateFor: ['0x11111111', '0x2222222']
}

const genericError = new Error('test')

import { ILCTransactionManager } from './ILCTransactionManager'
import { LCTransactionManager } from './LCTransactionManager'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'

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

const lcMock = {
  applicantId: 'applicantId',
  beneficiaryId: 'beneficiaryId',
  issuingBankId: 'issuingBankId',
  beneficiaryBankId: 'beneficiaryBankId'
}

const lcCacheDataAgentMock: ILCCacheDataAgent = {
  getLC: jest.fn(),
  getLCs: jest.fn(),
  saveLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  updateLcByReference: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

const companyServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

describe('LCTransactionManager', async () => {
  let txManager: ILCTransactionManager

  beforeEach(() => {
    signerClientMock.getKey.mockReset()
    signerClientMock.postTransaction.mockReset()
    setupSignerMock()
    txManager = new LCTransactionManager(
      signerClientMock,
      '0x123',
      'applicantId',
      lcContractMock,
      lcCacheDataAgentMock,
      companyServiceMock
    )
    lcCacheDataAgentMock.getLC = jest.fn().mockImplementation(() => lcMock)
    companyServiceMock.getNodeKeys = jest.fn().mockImplementationOnce(() => ['0x11111111', '0x2222222'])
  })

  describe('deployLC', () => {
    it('should return a tx hash after successfully deploying a new LC', async () => {
      signerClientMock.postTransaction.mockImplementation(() => postTxResult)
      const result = await txManager.deployLC(lcParams)
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual(txHash)
    })

    it('Should add privateFor with constellation keys of the parties', async () => {
      signerClientMock.postTransaction.mockImplementation(() => postTxResult)
      const result = await txManager.deployLC(lcParams)
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith({
        from: '0x123',
        value: '0x00',
        data: 'encodedData',
        privateFor: ['0x11111111', '0x2222222']
      })
      expect(result).toEqual(txHash)
    })

    it('should throw if getKey throws', async () => {
      signerClientMock.postTransaction.mockImplementation(() => postTxResult)
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      expect(txManager.deployLC(lcParams)).rejects.toBeDefined()
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(0)
    })

    it('should throw if postTransaction throws', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.deployLC(lcParams)).rejects.toBeDefined()
      expect(signerClientMock.getKey).toHaveBeenCalledTimes(2)
    })
  })

  describe('issueLC', () => {
    const sampleDocumentHash = '0x0'
    const sampleDocReference = 'ref-1234'

    it('should return a tx hash after issue an LC', async () => {
      setupSignerMock()
      lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => lcMock)
      const result = await txManager.issueLC(sampleAddress, sampleDocumentHash, sampleDocReference)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.issueLC(sampleAddress, sampleDocumentHash, sampleDocReference)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.issueLC(sampleAddress, sampleDocumentHash, sampleDocReference)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.issueLC(sampleAddress, sampleDocumentHash, sampleDocReference)).rejects.toBeDefined()
    })
  })

  describe('requestRejectLC', () => {
    const comments = '0x0'

    it('should return a tx hash after requestReject an LC', async () => {
      setupSignerMock()
      lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => lcMock)
      const result = await txManager.requestRejectLC(sampleAddress, comments)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.requestRejectLC(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.requestRejectLC(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.requestRejectLC(sampleAddress, comments)).rejects.toBeDefined()
    })
  })

  describe('issuedLCRejectByBeneficiary', () => {
    const comments = '0x0'
    it('should return a tx hash after reject an issued LC', async () => {
      setupSignerMock()
      lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => lcMock)
      const result = await txManager.issuedLCRejectByBeneficiary(sampleAddress, comments)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.issuedLCRejectByBeneficiary(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.issuedLCRejectByBeneficiary(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.issuedLCRejectByBeneficiary(sampleAddress, comments)).rejects.toBeDefined()
    })
  })

  describe('issuedLCRejectByAdvisingBank', () => {
    const comments = '0x0'

    it('should return a tx hash after reject an issued LC', async () => {
      setupSignerMock()
      lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => lcMock)
      const result = await txManager.issuedLCRejectByAdvisingBank(sampleAddress, comments)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.issuedLCRejectByAdvisingBank(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.issuedLCRejectByAdvisingBank(sampleAddress, comments)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.issuedLCRejectByAdvisingBank(sampleAddress, comments)).rejects.toBeDefined()
    })
  })

  describe('adviseLC', () => {
    it('should return a tx hash after advising an LC', async () => {
      setupSignerMock()
      lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => lcMock)
      const result = await txManager.adviseLC(sampleAddress)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.adviseLC(sampleAddress)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.adviseLC(sampleAddress)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.adviseLC(sampleAddress)).rejects.toBeDefined()
    })
  })

  describe('acknowledgeLC', () => {
    it('should return a tx hash after acknowledge an LC', async () => {
      setupSignerMock()
      lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => lcMock)
      const result = await txManager.acknowledgeLC(sampleAddress)

      expect(signerClientMock.getKey).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledTimes(1)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith(transactionObject)
      expect(result).toEqual(txHash)
    })

    it('should throw an error if the getKey fail', async () => {
      signerClientMock.getKey.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.acknowledgeLC(sampleAddress)).rejects.toBeDefined()
    })

    it('should throw an error if the postTransaction fail', async () => {
      signerClientMock.postTransaction.mockImplementation(() => {
        throw genericError
      })
      signerClientMock.getKey.mockImplementation(() => key)
      await expect(txManager.acknowledgeLC(sampleAddress)).rejects.toBeDefined()
    })

    it('should throw an error if the signing fail', async () => {
      signerClientMock.sign.mockImplementation(() => {
        throw genericError
      })
      await expect(txManager.acknowledgeLC(sampleAddress)).rejects.toBeDefined()
    })
  })
})
