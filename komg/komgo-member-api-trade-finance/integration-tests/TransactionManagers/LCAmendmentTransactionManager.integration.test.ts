import 'reflect-metadata'

import { buildFakeAmendment } from '@komgo/types'

import { ICompanyRegistryService } from '../../src/service-layer/ICompanyRegistryService'
import { ISignerClient } from '../../src/business-layer/common/ISignerClient'
import { CompanyRegistryMockService } from '../mocks/CompanyRegistryMockService'
import { SignerMockClient } from '../mocks/SignerMockClient'
import { web3Instance, getAccounts } from '../utils/web3Provider'
import { sampleLC } from '../sampledata/sampleLC'
import { setupEns, membersInfo } from '@komgo/smart-contracts'
import { LCAmendmentContract } from '../../src/business-layer/blockchain/LCAmendmentContract'
import { ILCAmendmentTransactionManager } from '../../src/business-layer/blockchain/ILCAmendmentTransactionManager'
import { LCAmendmentTransactionManager } from '../../src/business-layer/blockchain/LCAmendmentTransactionManager'
import { ILCTransactionManager } from '../../src/business-layer/blockchain/ILCTransactionManager'
import { LCContract } from '../../src/business-layer/blockchain/LCContract'
import { LCTransactionManager } from '../../src/business-layer/blockchain/LCTransactionManager'
import { LCCacheMockDataAgent } from '../mocks/LCCacheMockDataAgent'
import { ILCCacheDataAgent } from '../../src/data-layer/data-agents'

jest.setTimeout(2000000)

describe('LCAmendment integration tests', () => {
  let signerClient: ISignerClient
  let lcAmendmentContractInstance: LCAmendmentContract
  let lcContractInstance: LCContract
  let lcMockDataAgent: ILCCacheDataAgent
  let lcTxManager: ILCTransactionManager
  let lcAmendmentTxManager: ILCAmendmentTransactionManager
  let companyRegistryMockInstance: ICompanyRegistryService
  let ensAddress: string
  let applicantGuid
  let applicantAddress: string
  let accounts: string[]
  let lcAmendmentResult: any
  let lcAmendmentAddress: string

  const currentState = async () => {
    await lcAmendmentContractInstance.at(lcAmendmentAddress)
    const result = await lcAmendmentContractInstance.getCurrentState()
    return result
  }

  const deployAmendment = async (defaultAccounts: string[], companyGuid: string, ensAddress: string) => {
    signerClient = new SignerMockClient(
      defaultAccounts,
      web3Instance,
      await membersInfo.getMemberPrivateKey(defaultAccounts[0])
    )
    lcAmendmentContractInstance = new LCAmendmentContract(web3Instance)
    companyRegistryMockInstance = new CompanyRegistryMockService()
    lcContractInstance = new LCContract(web3Instance)
    lcMockDataAgent = new LCCacheMockDataAgent()

    lcTxManager = new LCTransactionManager(
      signerClient,
      ensAddress,
      companyGuid,
      lcContractInstance,
      lcMockDataAgent,
      companyRegistryMockInstance
    )

    lcAmendmentTxManager = new LCAmendmentTransactionManager(
      signerClient,
      ensAddress,
      companyGuid,
      companyRegistryMockInstance,
      lcAmendmentContractInstance
    )
    const lcDeployed: any = await lcTxManager.deployLC(sampleLC)
    console.log(`LCDeployed=${lcDeployed.contractAddress}`)
    sampleLC.contractAddress = lcDeployed.contractAddress
    const lcAmendmentDeployed: any = await lcAmendmentTxManager.deployInitial(sampleLC, buildFakeAmendment(), [
      sampleLC.applicantId,
      sampleLC.issuingBankId,
      sampleLC.beneficiaryId
    ])
    lcAmendmentAddress = lcAmendmentDeployed.contractAddress
    return lcAmendmentDeployed
  }

  beforeAll(async done => {
    applicantGuid = membersInfo.getApplicantGuid()
    accounts = await web3Instance.eth.getAccounts()
    const defaultAccount = accounts.slice(0, 1)
    console.log('Default account', defaultAccount)
    applicantAddress = defaultAccount[0]
    await web3Instance.eth.personal.unlockAccount(applicantAddress, '', 15000)
    const ens = await setupEns(web3Instance, defaultAccount)
    ensAddress = ens.ensRegistry.options.address
    console.log('ensRegistry address', ensAddress)
    done()
  })

  beforeEach(async done => {
    lcAmendmentResult = await deployAmendment(accounts, applicantGuid, ensAddress)
    done()
  })

  describe('deployAmendment', () => {
    it('should deploy an LC Amendment', async () => {
      expect(lcAmendmentResult).toBeDefined()
      expect(lcAmendmentResult.contractAddress).toBeDefined()
      expect(await currentState()).toEqual(web3Instance.utils.sha3('requested'))
    })

    it('issuing bank approval', async () => {
      const result = await lcAmendmentTxManager.approveByIssuingBank(
        lcAmendmentResult.contractAddress,
        [],
        'doc',
        'ref'
      )
      expect(result).toBeDefined()
      expect(await currentState()).toEqual(web3Instance.utils.sha3('approved by issuing bank'))
    })

    it('issuing bank rejection', async () => {
      const result = await lcAmendmentTxManager.rejectByIssuingBank(
        lcAmendmentResult.contractAddress,
        [],
        'rejected because yes'
      )
      expect(result).toBeDefined()
      expect(await currentState()).toEqual(web3Instance.utils.sha3('rejected by issuing bank'))
    })
  })
})
