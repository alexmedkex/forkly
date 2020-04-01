import 'reflect-metadata'
import { LCPresentationTransactionManager } from './LCPresentationTransactionManager'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { LCPresentationStatus } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import SignerClient from '../common/SignerClient'
import { LCPresentationContract } from './LCPresentationContract'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'

const mockPresentationData: ILCPresentation = {
  staticId: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
  beneficiaryId: 'beneficiaryId',
  applicantId: 'applicantId',
  nominatedBankId: 'nominatedBankId',
  issuingBankId: 'issuingBankId',
  LCReference: 'LC-1234',
  reference: '1234',
  status: LCPresentationStatus.Draft,
  documents: [
    {
      documentHash: '0x2f10691f224069221c0739600e3612677c3e763616420a5543176b551e607212',
      documentTypeId: 'invoice',
      dateProvided: new Date()
    }
  ]
}

const mockLc: any = {
  contractAddress: '0xE4f4d8aD3Ad682F62AeF1dff017A83E48CDD1B89'
}

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

const mockContract = createMockInstance(LCPresentationContract)
mockContract.getSignatureParameters.mockImplementation(() => ({
  v: '27',
  r: '0x111111',
  s: '0x222222'
}))
mockContract.instance.mockImplementation(() => new MockContract())

const key = '0x123'

const signerClientMock = createMockInstance(SignerClient)
const setupSignerMock = () => {
  signerClientMock.sign.mockImplementation(() =>
    Promise.resolve({
      data: '0x123'
    })
  )
  signerClientMock.getKey.mockImplementation(() => key)
  signerClientMock.postTransaction.mockImplementation(() => ({ data: { txHash: '0x1234' } }))
}

const companyServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

describe('LCPresentationTransactionManager', () => {
  let transactionManager: LCPresentationTransactionManager
  beforeEach(() => {
    setupSignerMock()
    transactionManager = new LCPresentationTransactionManager(
      signerClientMock,
      null,
      null,
      companyServiceMock,
      mockContract
    )
  })

  it('should deploy presentation', async () => {
    await transactionManager.deployDocPresented(mockPresentationData, mockLc)

    expect(signerClientMock.postTransaction).toHaveBeenCalled()
  })
})
