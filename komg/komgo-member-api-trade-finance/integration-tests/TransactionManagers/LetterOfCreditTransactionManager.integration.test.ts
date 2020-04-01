import 'reflect-metadata'

import { buildFakeLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { setupEns, membersInfo } from '@komgo/smart-contracts'

import {
  ILetterOfCreditTransactionManager,
  LetterOfCreditTransactionManager,
  ILetterOfCreditContract,
  LetterOfCreditContract
} from '../../src/business-layer/letter-of-credit/tx-managers'
import { ICompanyRegistryService } from '../../src/service-layer/ICompanyRegistryService'
import { ILetterOfCreditDataAgent } from '../../src/data-layer/data-agents'
import { ISignerClient } from '../../src/business-layer/common/ISignerClient'

import { CompanyRegistryMockService } from '../mocks/CompanyRegistryMockService'
import { web3Instance } from '../utils/web3Provider'
import { LetterOfCreditMockDataAgent } from '../mocks/LetterOfCreditMockDataAgent'
import { SignerMockClient } from '../mocks/SignerMockClient'
import { soliditySha3 } from '../../src/business-layer/common/HashFunctions'

jest.setTimeout(2000000)

describe('LetterOfCreditTransactionManager integration tests', () => {
  let signerClient: ISignerClient
  let letterOfCreditContractInstance: ILetterOfCreditContract
  let letterOfCreditTxManager: ILetterOfCreditTransactionManager
  let companyRegistryMockInstance: ICompanyRegistryService
  let ensAddress: string
  let applicantGuid
  let applicantAddress: string
  let accounts: string[]
  let letterOfCreditResult: any
  let letterOfCreditDataAgent: ILetterOfCreditDataAgent

  const getCurrentState = async () => {
    const result = await letterOfCreditContractInstance.getCurrentState()
    return result
  }

  const deployLetterOfCredit = async (defaultAccounts: string[], companyGuid: string, ensAddress: string) => {
    try {
      signerClient = new SignerMockClient(
        defaultAccounts,
        web3Instance,
        await membersInfo.getMemberPrivateKey(defaultAccounts[0])
      )
      letterOfCreditContractInstance = new LetterOfCreditContract(web3Instance)
      companyRegistryMockInstance = new CompanyRegistryMockService()
      letterOfCreditDataAgent = new LetterOfCreditMockDataAgent()

      letterOfCreditTxManager = new LetterOfCreditTransactionManager(
        signerClient,
        ensAddress,
        companyGuid,
        letterOfCreditContractInstance,
        letterOfCreditDataAgent,
        companyRegistryMockInstance
      )
      const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit()
      letterOfCredit.templateInstance.data.applicant.staticId = companyGuid
      letterOfCredit.templateInstance.data.issuingBank.staticId = companyGuid
      letterOfCredit.templateInstance.data.beneficiary.staticId = companyGuid
      return letterOfCreditTxManager.deploy(letterOfCredit)
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
    letterOfCreditResult = await deployLetterOfCredit(accounts, applicantGuid, ensAddress)
    done()
  })

  describe('deploy', () => {
    it('should deploy a letter of credit', async () => {
      expect(letterOfCreditResult).toBeDefined()
      expect(letterOfCreditResult.contractAddress).toBeDefined()
    })
  })

  describe('issue', () => {
    it('should issue', async () => {
      const result = await letterOfCreditTxManager.issue(
        letterOfCreditResult.contractAddress,
        buildFakeLetterOfCredit()
      )
      expect(result).toBeDefined()
      expect(await getCurrentState()).toEqual(soliditySha3('issued'))
    })
  })

  describe('requestReject', () => {
    it('should request reject', async () => {
      const result = await letterOfCreditTxManager.requestReject(letterOfCreditResult.contractAddress)
      expect(result).toBeDefined()
      expect(await getCurrentState()).toEqual(soliditySha3('request rejected'))
    })
  })
})
