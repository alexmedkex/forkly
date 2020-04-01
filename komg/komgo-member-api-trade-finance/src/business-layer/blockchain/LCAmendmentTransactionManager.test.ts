import 'reflect-metadata'
import { LCAmendmentTransactionManager } from './LCAmendmentTransactionManager'
import createMockInstance from 'jest-create-mock-instance'
import SignerClient from '../common/SignerClient'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ILCAmendment, LCAmendmentStatus, AMENDMENT_SCHEMA_VERSIONS } from '@komgo/types'
import { ILC } from '../../data-layer/models/ILC'
import { LC_STATE } from '../events/LC/LCStates'
import { LCAmendmentContract } from './LCAmendmentContract'
import BlockchainConnectionException from '../../exceptions/BlockchainConnectionException'

const mockAmendment: ILCAmendment = {
  version: AMENDMENT_SCHEMA_VERSIONS.V1,
  diffs: [],
  lcStaticId: '',
  lcReference: 'BP-2019-001',
  status: LCAmendmentStatus.Requested,
  createdAt: new Date('2019-02-01').toISOString(),
  updatedAt: new Date('2019-02-01').toISOString(),
  transactionHash: '0x00000',
  contractAddress: '0x00001',
  documentHash: 'sha3',
  reference: 'a reference',
  stateHistory: [],
  staticId: '8f226846-70ca-4320-9783-f09d2f4a65fe'
}

const mockLc: ILC = {
  _id: '5c3f10120fab2caac20ca822',
  contractAddress: '0xE4f4d8aD3Ad682F62AeF1dff017A83E48CDD1B89',
  cargoIds: [],
  partialShipmentAllowed: true,
  transhipmentAllowed: false,
  type: 'IRREVOCABLE',
  direct: false,
  applicantId: 'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85',
  billOfLadingEndorsement: 'IssuingBank',
  currency: 'USD',
  amount: 42012000,
  applicantContactPerson: '',
  beneficiaryContactPerson: '',
  issuingBankContactPerson: '',
  beneficiaryBankContactPerson: '',
  feesPayableBy: 'SPLIT',
  beneficiaryBankRole: 'AdvisingBank',
  applicableRules: 'UCP_LATEST_VERSION',
  availableBy: 'DEFERRED_PAYMENT',
  expiryPlace: 'AdvisingBank',
  availableWith: 'AdvisingBank',
  documentPresentationDeadlineDays: 21,
  LOIAllowed: true,
  LOIType: 'KOMGO_LOI',
  LOI: 'template',
  beneficiaryId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
  expiryDate: '2018-02-14',
  issuingBankId: 'a28b8dc3-8de9-4559-8ca1-272ccef52b47',
  beneficiaryBankId: '1bc05a66-1eba-44f7-8f85-38204e4d3516',
  reference: '2019-BP-6',
  tradeAndCargoSnapshot: null,
  draftLCDocumentHash: '0x6d201c734c215f170d27556d1b0d534e6852750a483b0b196427570e6f356231',
  commercialContractDocumentHash: '',
  status: LC_STATE.REQUESTED,
  transactionHash: '0x432247cef359af8a99747db2b33b0a0fbf37f7acb80748936ae9b831812cf293',
  stateHistory: []
  // createdAt: new Date('2019-01-16T11:05:54.249Z').toISOString(),
  // updatedAt: new Date('2019-01-16T11:05:54.249Z').toISOString(),
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

const mockContract = createMockInstance(LCAmendmentContract)

mockContract.getSignatureParameters.mockImplementation(() => ({
  v: '27',
  r: '0x111111',
  s: '0x222222'
}))

mockContract.instance.mockImplementation(() => new MockContract())

const key = '0x123'
const txHash = '0x1234'

const signerClientMock = createMockInstance(SignerClient)

const setupSignerMock = () => {
  signerClientMock.sign.mockImplementation(() =>
    Promise.resolve({
      data: key
    })
  )
  signerClientMock.getKey.mockImplementation(() => ({ data: key }))
  signerClientMock.postTransaction.mockImplementation(() => ({
    data: { txHash }
  }))
}

const companyServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

describe('LCAmendmentTransactionManager', () => {
  let transactionManager: LCAmendmentTransactionManager
  beforeEach(() => {
    setupSignerMock()
    transactionManager = new LCAmendmentTransactionManager(
      signerClientMock,
      null,
      null,
      companyServiceMock,
      mockContract
    )
  })

  it('deploys the smart contract', async () => {
    const transaction = await transactionManager.deployInitial(mockLc, mockAmendment, [])
    expect(transaction).toEqual({ txHash })
    expect(signerClientMock.postTransaction).toHaveBeenCalledWith({
      data: 'encodedData',
      from: key,
      privateFor: undefined,
      value: '0x00'
    })
  })

  describe('failure', () => {
    it('fails to get the signature', async () => {
      const error = new Error('Boom!')
      signerClientMock.sign.mockImplementation(() => Promise.reject(error))
      await expect(transactionManager.deployInitial(mockLc, mockAmendment, [])).rejects.toBeInstanceOf(Error)
      expect(signerClientMock.postTransaction).toHaveBeenCalledWith({
        data: 'encodedData',
        from: key,
        privateFor: undefined,
        value: '0x00'
      })
    })
  })
})
