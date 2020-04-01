import 'reflect-metadata'
import { LCTransactionManager } from '../../src/business-layer/blockchain/LCTransactionManager'
import { ILCTransactionManager } from '../../src/business-layer/blockchain/ILCTransactionManager'
import { LCContract } from '../../src/business-layer/blockchain/LCContract'
import { ILCCacheDataAgent } from '../../src/data-layer/data-agents'
import { LCCacheMockDataAgent } from '../mocks/LCCacheMockDataAgent'
import { CompanyRegistryMockService } from '../mocks/CompanyRegistryMockService'
import { ICompanyRegistryService } from '../../src/service-layer/ICompanyRegistryService'
import { ISignerClient } from '../../src/business-layer/common/ISignerClient'
import { SignerMockClient } from '../mocks/SignerMockClient'
import { web3Instance, getAccounts } from '../utils/web3Provider'
import { sampleLC } from '../sampledata/sampleLC'
import { setupEns, membersInfo } from '@komgo/smart-contracts'

jest.setTimeout(200000)

const sampleMT700 = '0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4'
const sampleReference = 'reference'
const beneficiaryCommentsOnRejection = 'comments'
const issuingBankCommentsOnRejection = 'comments'
const advisingBankCommentsOnRejection = 'comments'

describe('LCTransactionManager integration tests', () => {
  let lcResult: any
  let signerClient: ISignerClient
  let lcContractInstance: LCContract
  let lcCacheDataAgentMock: ILCCacheDataAgent
  let lcTxManager: ILCTransactionManager
  let companyRegistryMockInstance: ICompanyRegistryService
  let ensAddress: string
  let applicantGuid
  let applicantAddress: string
  let accounts: string[]

  const currentState = async () => {
    const result = await lcContractInstance.getCurrentState()
    return web3Instance.utils.hexToAscii(result).replace(/\u0000/g, '')
  }

  const deployLC = async (defaultAccounts: string[], companyGuid: string, ensAddress: string) => {
    const accounts = defaultAccounts
    const firstAccount = accounts.slice(0, 1)
    console.log('First account', firstAccount)
    signerClient = new SignerMockClient(
      firstAccount,
      web3Instance,
      await membersInfo.getMemberPrivateKey(firstAccount[0])
    )
    lcContractInstance = new LCContract(web3Instance)
    lcCacheDataAgentMock = new LCCacheMockDataAgent()
    companyRegistryMockInstance = new CompanyRegistryMockService()

    lcTxManager = new LCTransactionManager(
      signerClient,
      ensAddress,
      companyGuid,
      lcContractInstance,
      lcCacheDataAgentMock,
      companyRegistryMockInstance
    )
    return lcTxManager.deployLC(sampleLC)
  }

  const reDeployLCWithoutAdvisingBank = async () => {
    const sampleLCWithoutAdvisingBank = { ...sampleLC, beneficiaryBankId: 0 }
    return lcTxManager.deployLC(sampleLCWithoutAdvisingBank)
  }

  beforeAll(async done => {
    applicantGuid = membersInfo.getApplicantGuid()
    accounts = await web3Instance.eth.getAccounts()
    const defaultAccount = accounts.slice(0, 1)
    console.log('Default account', defaultAccount)
    const ens = await setupEns(web3Instance, defaultAccount)
    ensAddress = ens.ensRegistry.options.address
    console.log('ensRegistry address', ensAddress)
    done()
  })

  beforeEach(async done => {
    lcResult = await deployLC(accounts, applicantGuid, ensAddress)
    done()
  })

  describe('deployLC', () => {
    it('should deploy an lc', async () => {
      expect(lcResult).toBeDefined()
      expect(lcResult.contractAddress).toBeDefined()
    })
  })

  describe('issueLC', () => {
    it('should issue an lc', async () => {
      const result = await lcTxManager.issueLC(lcResult.contractAddress, sampleMT700, sampleReference)

      expect(result).toBeDefined()
      expect(await currentState()).toEqual('issued')
    })
  })

  describe('requestRejectLC', () => {
    it('should request reject an lc', async () => {
      const result = await lcTxManager.requestRejectLC(lcResult.contractAddress, issuingBankCommentsOnRejection)

      expect(result).toBeDefined()
      expect(await currentState()).toEqual('request rejected')
    })
  })

  describe('issuedLCRejectByBeneficiary', () => {
    it('should reject an issued lc by the beneficiary', async () => {
      lcResult = await reDeployLCWithoutAdvisingBank()

      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(1))
      await lcTxManager.issueLC(lcResult.contractAddress, sampleMT700, sampleReference)

      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(2))
      const result = await lcTxManager.issuedLCRejectByBeneficiary(
        lcResult.contractAddress,
        beneficiaryCommentsOnRejection
      )

      expect(result).toBeDefined()
      expect(await currentState()).toEqual('issued lc rejected')
    })
  })

  describe('issuedLCRejectByAdvisingBank', () => {
    it('should reject an issued lc by the advising bank', async () => {
      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(1))
      await lcTxManager.issueLC(lcResult.contractAddress, sampleMT700, sampleReference)

      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(2))
      const result = await lcTxManager.issuedLCRejectByAdvisingBank(
        lcResult.contractAddress,
        advisingBankCommentsOnRejection
      )

      expect(result).toBeDefined()
      expect(await currentState()).toEqual('issued lc rejected')
    })
  })

  describe('adviseLC', () => {
    it('should advise an lc', async () => {
      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(1))
      await lcTxManager.issueLC(lcResult.contractAddress, sampleMT700, sampleReference)

      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(2))
      const result = await lcTxManager.adviseLC(lcResult.contractAddress)

      expect(result).toBeDefined()
      expect(await currentState()).toEqual('advised')
    })
  })

  describe('acknowledgeLC', () => {
    it('should deploy an lc', async () => {
      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(1))
      await lcTxManager.issueLC(lcResult.contractAddress, sampleMT700, sampleReference)

      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(2))
      await lcTxManager.adviseLC(lcResult.contractAddress)

      lcCacheDataAgentMock.getNonce = jest.fn().mockImplementation(() => Promise.resolve(3))
      const result = await lcTxManager.acknowledgeLC(lcResult.contractAddress)

      expect(result).toBeDefined()
      expect(await currentState()).toEqual('acknowledged')
    })
  })
})
