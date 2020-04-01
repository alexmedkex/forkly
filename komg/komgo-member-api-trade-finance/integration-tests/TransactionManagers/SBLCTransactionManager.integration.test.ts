import 'reflect-metadata'

import { buildFakeStandByLetterOfCredit } from '@komgo/types'

import { ICompanyRegistryService } from '../../src/service-layer/ICompanyRegistryService'
import { ISBLCTransactionManager } from '../../src/business-layer/blockchain/SBLC/ISBLCTransactionManager'
import { SBLCTransactionManager } from '../../src/business-layer/blockchain/SBLC/SBLCTransactionManager'
import { ISBLCDataAgent } from '../../src/data-layer/data-agents'
import { ISignerClient } from '../../src/business-layer/common/ISignerClient'
import { ISBLCContract } from '../../src/business-layer/blockchain/SBLC/ISBLCContract'
import { SBLCContract } from '../../src/business-layer/blockchain/SBLC/SBLCContract'
import { soliditySha3 } from '../../src/business-layer/common/HashFunctions'

import { CompanyRegistryMockService } from '../mocks/CompanyRegistryMockService'
import { web3Instance } from '../utils/web3Provider'
import { SBLCMockDataAgent } from '../mocks/SBLCMockDataAgent'
import { SignerMockClient } from '../mocks/SignerMockClient'
import { setupEns, membersInfo } from '@komgo/smart-contracts'

jest.setTimeout(2000000)

describe('SBLCTransactionManager integration tests', () => {
  let signerClient: ISignerClient
  let sblcContractInstance: ISBLCContract
  let sblcTxManager: ISBLCTransactionManager
  let companyRegistryMockInstance: ICompanyRegistryService
  let ensAddress: string
  let applicantGuid
  let applicantAddress: string
  let accounts: string[]
  let sblcResult: any
  let sblcDataAgent: ISBLCDataAgent

  const sampleMT700 = '0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4'
  const sampleReference = 'reference'
  const issuingBankPostalAddress = 'Address'
  const issuingBankCommentsOnRejection = 'comments'

  const currentState = async () => {
    const result = await sblcContractInstance.getCurrentState()
    return result
  }

  const deploySBLC = async (defaultAccounts: string[], companyGuid: string, ensAddress: string) => {
    try {
      signerClient = new SignerMockClient(
        defaultAccounts,
        web3Instance,
        await membersInfo.getMemberPrivateKey(defaultAccounts[0])
      )
      sblcContractInstance = new SBLCContract(web3Instance)
      companyRegistryMockInstance = new CompanyRegistryMockService()
      sblcDataAgent = new SBLCMockDataAgent()

      sblcTxManager = new SBLCTransactionManager(
        signerClient,
        ensAddress,
        companyGuid,
        sblcContractInstance,
        sblcDataAgent,
        companyRegistryMockInstance
      )
      return sblcTxManager.deploy(
        buildFakeStandByLetterOfCredit({
          applicantId: membersInfo.getApplicantGuid(),
          beneficiaryBankId: membersInfo.getApplicantGuid(),
          issuingBankId: membersInfo.getApplicantGuid(),
          beneficiaryId: membersInfo.getApplicantGuid()
        })
      )
    } catch (error) {
      console.log('There was an error', error)
    }
  }

  beforeAll(async done => {
    applicantGuid = membersInfo.getApplicantGuid()
    accounts = await web3Instance.eth.getAccounts()
    const defaultAccount = accounts.slice(0, 1)
    applicantAddress = defaultAccount[0]
    const ens = await setupEns(web3Instance, defaultAccount)
    ensAddress = ens.ensRegistry.options.address
    console.log('ensRegistry address', ensAddress)
    done()
  })

  beforeEach(async done => {
    sblcResult = await deploySBLC(accounts, applicantGuid, ensAddress)
    done()
  })

  describe('deploySBLC', () => {
    it('should deploy an sblc', async () => {
      expect(sblcResult).toBeDefined()
      expect(sblcResult.contractAddress).toBeDefined()
    })
  })

  describe('issue', () => {
    it('should issue an lc', async () => {
      const result = await sblcTxManager.issue(
        sblcResult.contractAddress,
        sampleMT700,
        sampleReference,
        issuingBankPostalAddress
      )

      expect(result).toBeDefined()
      expect(await currentState()).toEqual(soliditySha3('issued'))
    })
  })

  describe('requestRejectSBLC', () => {
    it('should request reject an lc', async () => {
      const result = await sblcTxManager.requestReject(sblcResult.contractAddress, issuingBankCommentsOnRejection)

      expect(result).toBeDefined()
      expect(await currentState()).toEqual(soliditySha3('request rejected'))
    })
  })
})
