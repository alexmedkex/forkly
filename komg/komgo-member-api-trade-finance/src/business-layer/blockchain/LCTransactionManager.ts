import { injectable, inject } from 'inversify'
import SmartContractInfo from '@komgo/smart-contracts'

import { ILCTransactionManager } from './ILCTransactionManager'
import { TYPES } from '../../inversify/types'
import { ILC } from '../../data-layer/models/ILC'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'

import { LCActionType } from './LCActionType'
import { HashMetaDomain } from '../common/HashFunctions'
import { CONFIG } from '../../inversify/config'
import { TransactionManagerBase } from '../common/TransactionManagerBase'
import { ISignerClient } from '../common/ISignerClient'
import { ILCContract } from './ILCContract'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { ContentNotFoundException } from '../../exceptions'

const pako = require('pako')

@injectable()
export class LCTransactionManager extends TransactionManagerBase<ILCContract, LCActionType>
  implements ILCTransactionManager {
  protected loggerName = 'LCTransactionManager'

  /**
   * @param signer - Signer client that abstracts and interacts with our signer api
   * @param ensAddress - ENSRegistry smart contract address
   */
  constructor(
    @inject(TYPES.SignerClient) signer: ISignerClient,
    @inject(CONFIG.RegistryContractAddress) ensAddress: string,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.LCContract) contract: ILCContract,
    @inject(TYPES.LCCacheDataAgent) private readonly lcDataAgent: ILCCacheDataAgent,
    @inject(TYPES.CompanyRegistryService) companyService: ICompanyRegistryService
  ) {
    super(signer, ensAddress, companyStaticId, companyService, contract, SmartContractInfo.LC.ByteCode)
  }

  /**
   * @param lcParams - The LC object parameters
   */
  public async deployLC(lcParams: ILC): Promise<string> {
    try {
      this.logger.info(`Deploying LC into blockchain`)
      const APPLICANT_NODE = HashMetaDomain(lcParams.applicantId)
      const BENEFICIARY_NODE = HashMetaDomain(lcParams.beneficiaryId)
      const ISSUING_BANK_NODE = HashMetaDomain(lcParams.issuingBankId)
      const BENEFICIARY_BANK_NODE = lcParams.beneficiaryBankId ? HashMetaDomain(lcParams.beneficiaryBankId) : '0x00'
      const lcApplicationData = JSON.stringify(lcParams)
      const lcApplicationDataCompressed = pako.deflate(lcApplicationData, { to: 'string' })
      const draftLCDocumentHash = lcParams.draftLCDocumentHash || ''
      const commercialContractDocumentHash = lcParams.commercialContractDocumentHash || ''

      const from = (await this.signer.getKey()).data
      const signature = await this.getSignatureData(lcApplicationDataCompressed, from)

      const contractArguments = [
        APPLICANT_NODE,
        BENEFICIARY_NODE,
        ISSUING_BANK_NODE,
        BENEFICIARY_BANK_NODE,
        lcApplicationDataCompressed,
        draftLCDocumentHash,
        commercialContractDocumentHash,
        this.ensAddress,
        signature.v,
        signature.r,
        signature.s
      ]
      const parties = [lcParams.applicantId, lcParams.beneficiaryId, lcParams.issuingBankId, lcParams.beneficiaryBankId]

      return this.deployContract(contractArguments, parties, from)
    } catch (error) {
      this.logger.info({ errorMessage: error.message, lc: lcParams })
      throw error
    }
  }

  async issueLC(contractAddress: string, mt700: string, reference: string): Promise<any> {
    let postResult
    try {
      const encodedData = await this.getTransactionEncodedData(contractAddress, 'issue', mt700, reference)
      postResult = await this.sendData(encodedData, contractAddress, await this.findAllLCParties(contractAddress))
    } catch (error) {
      this.logger.info('issue LC failed', { contractAddress, mt700, reference })
      throw error
    }
    return postResult.data
  }

  async requestRejectLC(contractAddress: string, comments: string): Promise<string> {
    let postResult
    this.logger.info('request reject LC', {
      contractAddress,
      comments
    })

    const encodedData = await this.getTransactionEncodedData(contractAddress, 'requestReject', comments)
    postResult = await this.sendData(encodedData, contractAddress, await this.findAllLCParties(contractAddress))

    return postResult.data
  }

  async issuedLCRejectByBeneficiary(contractAddress: string, comments: string) {
    let postResult
    this.logger.info('rejecting issued LC by beneficiary', {
      contractAddress,
      comments
    })

    const encodedData = await this.getTransactionEncodedData(contractAddress, 'issuedLCRejectByBeneficiary', comments)
    postResult = await this.sendData(encodedData, contractAddress, await this.findAllLCParties(contractAddress))

    return postResult.data
  }

  async issuedLCRejectByAdvisingBank(contractAddress: string, comments: string) {
    let postResult
    this.logger.info('rejecting issued LC by advising bank', {
      contractAddress,
      comments
    })

    const encodedData = await this.getTransactionEncodedData(contractAddress, 'issuedLCRejectByAdvisingBank', comments)
    postResult = await this.sendData(encodedData, contractAddress, await this.findAllLCParties(contractAddress))

    return postResult.data
  }

  async adviseLC(contractAddress: string): Promise<string> {
    let postResult
    this.logger.info('advising LC', {
      contractAddress
    })

    const encodedData = await this.getTransactionEncodedData(contractAddress, 'advise')
    postResult = await this.sendData(encodedData, contractAddress, await this.findAllLCParties(contractAddress))

    return postResult.data
  }

  async acknowledgeLC(contractAddress: string): Promise<string> {
    let postResult
    this.logger.info('acknowledging LC', {
      contractAddress
    })

    const encodedData = await this.getTransactionEncodedData(contractAddress, 'acknowledge')
    postResult = await this.sendData(encodedData, contractAddress, await this.findAllLCParties(contractAddress))

    return postResult.data
  }

  protected async getCachedNonce(contractAddress: string): Promise<number> {
    this.logger.info(`Getting cached nonce for LC from a database contract address ${contractAddress}`)
    return this.lcDataAgent.getNonce(contractAddress)
  }

  private async findAllLCParties(contractAddress: string): Promise<string[]> {
    const lc = await this.lcDataAgent.getLC({ contractAddress })
    if (!lc) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCTransactionManagerLCNotFound,
        `LC for address=${contractAddress} not found`,
        { LCAddress: contractAddress },
        new Error().stack
      )
      throw new ContentNotFoundException(`LC for address=${contractAddress} not found`)
    }
    const applicantStaticId = lc.applicantId
    const beneficiaryStaticId = lc.beneficiaryId
    const issuingBankStaticId = lc.issuingBankId
    const beneficiaryBankStaticId = lc.beneficiaryBankId

    if (!applicantStaticId || !beneficiaryStaticId || !issuingBankStaticId) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCTransactionManagerLCPartiesNotFound,
        'Could not find LC parties',
        {
          LCAddress: contractAddress,
          applicant: applicantStaticId,
          beneficiary: beneficiaryBankStaticId,
          issuing: issuingBankStaticId
        },
        new Error().stack
      )
      throw new ContentNotFoundException(
        `Some of the mandatory parties for LC=${contractAddress} is empty. applicant=${applicantStaticId}, beneficiary=${beneficiaryStaticId}, issuing=${issuingBankStaticId}`
      )
    }

    const parties = [applicantStaticId, beneficiaryStaticId, issuingBankStaticId]
    if (beneficiaryBankStaticId) {
      parties.push(beneficiaryBankStaticId)
    }
    return this.removeMyselfFromParties(parties.map(party => HashMetaDomain(party)))
  }
}
