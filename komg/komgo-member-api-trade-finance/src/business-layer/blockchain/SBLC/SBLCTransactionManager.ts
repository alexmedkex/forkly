import { injectable, inject } from 'inversify'
import SmartContractInfo from '@komgo/smart-contracts'

import { TYPES } from '../../../inversify/types'
import { IStandbyLetterOfCredit as ISBLC } from '@komgo/types'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'

import { TransactionManagerBase } from '../../common/TransactionManagerBase'
import SignerClient from '../../common/SignerClient'
import { HashMetaDomain } from '../../common/HashFunctions'

import { SBLCActionType } from './SBLCActionType'
import { ISBLCContract } from './ISBLCContract'
import { ISBLCTransactionManager } from './ISBLCTransactionManager'
import { CONFIG } from '../../../inversify/config'
import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { ContentNotFoundException } from '../../../exceptions'

const pako = require('pako')

@injectable()
export class SBLCTransactionManager extends TransactionManagerBase<ISBLCContract, SBLCActionType>
  implements ISBLCTransactionManager {
  protected loggerName = 'SBLCTransactionManager'

  /**
   * @param signer - Signer client that abstracts and interacts with our signer api
   * @param ensAddress - ENSRegistry smart contract address
   * @param companyStaticId - Company static guid
   * @param contract - SBLC contract instance
   * @param companyService - Company service instance
   */
  constructor(
    @inject(TYPES.SignerClient) signer: SignerClient | any,
    @inject(CONFIG.RegistryContractAddress) ensAddress: string,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.SBLCContract) contract: ISBLCContract,
    @inject(TYPES.SBLCDataAgent) private sblcCacheDataAgent: ISBLCDataAgent,
    @inject(TYPES.CompanyRegistryService) companyService: ICompanyRegistryService
  ) {
    super(signer, ensAddress, companyStaticId, companyService, contract, SmartContractInfo.SBLC.ByteCode)
  }

  /**
   * @param sblcParams - The SBLC object parameters
   */
  public async deploy(sblcParams: ISBLC): Promise<string> {
    try {
      this.logger.info(`Deploying SBLC into blockchain`)
      const APPLICANT_NODE = HashMetaDomain(sblcParams.applicantId)
      const BENEFICIARY_NODE = HashMetaDomain(sblcParams.beneficiaryId)
      const ISSUING_BANK_NODE = HashMetaDomain(sblcParams.issuingBankId)
      const BENEFICIARY_BANK_NODE = sblcParams.beneficiaryBankId ? HashMetaDomain(sblcParams.beneficiaryBankId) : '0x00'
      const sblcData = JSON.stringify(sblcParams)
      const sblcDataCompressed = pako.deflate(sblcData, { to: 'string' })
      const draftLCDocumentHash = sblcParams.documentHash || ''
      const commercialContractDocumentHash = sblcParams.commercialContractDocumentHash || ''

      const from = (await this.signer.getKey()).data

      const signature = await this.getSignatureData(sblcDataCompressed, from)

      const contractArguments = [
        APPLICANT_NODE,
        BENEFICIARY_NODE,
        ISSUING_BANK_NODE,
        BENEFICIARY_BANK_NODE,
        sblcDataCompressed,
        draftLCDocumentHash,
        commercialContractDocumentHash,
        this.ensAddress,
        signature.v,
        signature.r,
        signature.s
      ]

      const parties = [sblcParams.applicantId, sblcParams.beneficiaryId, sblcParams.issuingBankId]

      if (sblcParams.beneficiaryBankId) {
        parties.push(sblcParams.beneficiaryBankId)
      }

      return super.deployContract(contractArguments, parties, from)
    } catch (error) {
      this.logger.info('deploy LC failed', { lc: sblcParams })
      throw error
    }
  }

  async issue(
    contractAddress: string,
    mt700: string,
    reference: string,
    issuingBankPostalAddress: string
  ): Promise<string> {
    let postResult
    this.logger.info('issuing SBLC', {
      contractAddress,
      mt700,
      reference,
      issuingBankPostalAddress
    })
    const parties = await this.findAllSBLCParties(contractAddress)
    const encodedData = await this.getTransactionEncodedData(
      contractAddress,
      'issue',
      mt700,
      reference,
      issuingBankPostalAddress
    )
    postResult = await this.sendData(encodedData, contractAddress, parties)

    return postResult.data
  }

  async requestReject(contractAddress: string, comments: string): Promise<string> {
    let postResult
    this.logger.info('request reject SBLC', {
      contractAddress,
      comments
    })
    const parties = await this.findAllSBLCParties(contractAddress)
    const encodedData = await this.getTransactionEncodedData(contractAddress, 'requestReject', comments)
    postResult = await this.sendData(encodedData, contractAddress, parties)

    return postResult.data
  }

  protected async getCachedNonce(contractAddress: string): Promise<number> {
    this.logger.info(`Getting cached nonce for SBLC from a database contract address ${contractAddress}`)
    return this.sblcCacheDataAgent.getNonce(contractAddress)
  }

  private async findAllSBLCParties(contractAddress: string): Promise<string[]> {
    const sblc = await this.sblcCacheDataAgent.getByContractAddress(contractAddress)
    if (!sblc) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCTransactionManagerSBLCNotFound,
        `SBLC for address=${contractAddress} not found`,
        { LCAddress: contractAddress },
        new Error().stack
      )
      throw new ContentNotFoundException(`SBLC not found`)
    }
    const applicantStaticId = sblc.applicantId
    const beneficiaryStaticId = sblc.beneficiaryId
    const issuingBankStaticId = sblc.issuingBankId
    const advisingBankStaticId = sblc.beneficiaryBankId

    if (!applicantStaticId || !beneficiaryStaticId || !issuingBankStaticId) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCTransactionManagerSBLCPartiesNotFound,
        'Could not find SBLC parties',
        {
          SBLCAddress: contractAddress,
          applicant: applicantStaticId,
          beneficiary: beneficiaryStaticId,
          issuing: issuingBankStaticId
        },
        new Error().stack
      )
      throw new ContentNotFoundException(
        `Some of the mandatory parties for SBLC=${contractAddress} are empty. applicant=${applicantStaticId}, beneficiary=${beneficiaryStaticId}, issuing=${issuingBankStaticId}`
      )
    }

    let parties = [applicantStaticId, beneficiaryStaticId, issuingBankStaticId]
    if (advisingBankStaticId) {
      parties.push(advisingBankStaticId)
    }
    parties = parties.map(party => HashMetaDomain(party))
    const partiesWithoutMyself = this.removeMyselfFromParties(parties)
    return partiesWithoutMyself
  }
}
