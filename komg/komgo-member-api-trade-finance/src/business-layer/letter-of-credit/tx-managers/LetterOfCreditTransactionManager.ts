import { injectable, inject } from 'inversify'
import SmartContractInfo from '@komgo/smart-contracts'
import { LetterOfCreditType, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents'
import { TYPES, CONFIG } from '../../../inversify'
import { TransactionManagerBase } from '../../common/TransactionManagerBase'
import SignerClient from '../../common/SignerClient'
import { HashMetaDomain, soliditySha3 } from '../../common/HashFunctions'
import { ILetterOfCreditTransactionManager } from '../../letter-of-credit/tx-managers/ILetterOfCreditTransactionManager'
import {
  LetterOfCreditActionType,
  LetterOfCreditAction
} from '../../letter-of-credit/tx-managers/LetterOfCreditActionType'
import { ILetterOfCreditContract } from '../../letter-of-credit/tx-managers/ILetterOfCreditContract'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { ContentNotFoundException } from '../../../exceptions'
import { removeNullsAndUndefined } from '../../../business-layer/util'

@injectable()
export class LetterOfCreditTransactionManager
  extends TransactionManagerBase<ILetterOfCreditContract, LetterOfCreditActionType>
  implements ILetterOfCreditTransactionManager {
  protected loggerName = 'LetterOfCreditTransactionManager'

  /**
   * @param signer - Signer client that abstracts and interacts with our signer api
   * @param ensAddress - ENSRegistry smart contract address
   * @param companyStaticId - Company static guid
   * @param contract - Letter of Credit Contract instance
   * @param companyService - Company service instance
   */
  constructor(
    @inject(TYPES.SignerClient) signer: SignerClient | any,
    @inject(CONFIG.RegistryContractAddress) ensAddress: string,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.LetterOfCreditContract) contract: ILetterOfCreditContract,
    @inject(TYPES.LetterOfCreditDataAgent) private letterOfCreditCacheDataAgent: ILetterOfCreditDataAgent,
    @inject(TYPES.CompanyRegistryService) companyService: ICompanyRegistryService
  ) {
    super(signer, ensAddress, companyStaticId, companyService, contract, SmartContractInfo.LetterOfCredit.ByteCode)
  }

  /**
   * @param letterOfCreditParams - The Letter of Credit object parameters
   */
  public async deploy(params: ILetterOfCredit<IDataLetterOfCredit>): Promise<any> {
    try {
      this.logger.info(`Deploying Letter of Credit into blockchain`)
      const { applicant, beneficiary, issuingBank } = params.templateInstance.data
      const hasBeneficiaryBank = params.templateInstance.data.beneficiaryBank ? true : false
      const APPLICANT_NODE = HashMetaDomain(applicant.staticId)
      const BENEFICIARY_NODE = HashMetaDomain(beneficiary.staticId)
      const ISSUING_BANK_NODE = HashMetaDomain(issuingBank.staticId)
      const BENEFICIARY_BANK_NODE = hasBeneficiaryBank
        ? HashMetaDomain(params.templateInstance.data.beneficiaryBank.staticId)
        : '0x00'

      const cloneLetterOfCredit = { ...params }
      delete cloneLetterOfCredit.status
      const letterOfCreditData = JSON.stringify(removeNullsAndUndefined(cloneLetterOfCredit))
      const from = (await this.signer.getKey()).data
      const type: number = params.type === LetterOfCreditType.Documentary ? 0 : 1

      const letterOfCreditDataHash = soliditySha3(letterOfCreditData)

      const signature = await this.getSignatureData(letterOfCreditDataHash, from)

      const contractArguments = [
        APPLICANT_NODE,
        BENEFICIARY_NODE,
        ISSUING_BANK_NODE,
        BENEFICIARY_BANK_NODE,
        letterOfCreditDataHash,
        this.ensAddress,
        type,
        signature.v,
        signature.r,
        signature.s
      ]

      const parties = [applicant.staticId, beneficiary.staticId, issuingBank.staticId]

      if (hasBeneficiaryBank) {
        parties.push(params.templateInstance.data.beneficiaryBank.staticId)
      }

      return super.deployContract(contractArguments, parties, from)
    } catch (error) {
      this.logger.info('deploy LC failed', { lc: params })
      throw error
    }
  }

  async issue(contractAddress: string, letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<any> {
    const parties = await this.findAllLetterOfCreditParties(contractAddress)
    // TODO: clone to not modify reference
    delete letterOfCredit.status
    delete letterOfCredit.hashedData
    delete letterOfCredit.updatedAt
    const hashedData = soliditySha3(JSON.stringify(letterOfCredit))
    const encodedData = await this.getTransactionEncodedData(contractAddress, LetterOfCreditAction.issue, hashedData)
    const postResult = await this.sendData(encodedData, contractAddress, parties)
    return postResult.data
  }

  async requestReject(contractAddress: string): Promise<any> {
    const parties = await this.findAllLetterOfCreditParties(contractAddress)
    const encodedData = await this.getTransactionEncodedData(contractAddress, LetterOfCreditAction.requestReject)
    const postResult = await this.sendData(encodedData, contractAddress, parties)
    return postResult.data
  }

  protected async getCachedNonce(contractAddress: string): Promise<number> {
    this.logger.info(`Getting cached nonce for LetterOfCredit from a database contract address ${contractAddress}`)
    return this.letterOfCreditCacheDataAgent.getNonce(contractAddress)
  }

  private async findAllLetterOfCreditParties(contractAddress: string): Promise<string[]> {
    const letterOfCredit = await this.letterOfCreditCacheDataAgent.getByContractAddress(contractAddress)
    if (!letterOfCredit) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LetterOfCreditTransactionManagerLetterOfCreditNotFound,
        `LetterOfCredit for address=${contractAddress} not found`,
        { LCAddress: contractAddress },
        new Error().stack
      )
      throw new ContentNotFoundException(`LetterOfCredit not found`)
    }
    const applicantStaticId = letterOfCredit.templateInstance.data.applicant.staticId
    const beneficiaryStaticId = letterOfCredit.templateInstance.data.beneficiary.staticId
    const issuingBankStaticId = letterOfCredit.templateInstance.data.issuingBank.staticId

    if (!applicantStaticId || !beneficiaryStaticId || !issuingBankStaticId) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCTransactionManagerSBLCPartiesNotFound,
        'Could not find LetterOfCredit parties',
        {
          LetterOfCreditAddress: contractAddress,
          applicant: applicantStaticId,
          beneficiary: beneficiaryStaticId,
          issuing: issuingBankStaticId
        },
        new Error().stack
      )
      throw new ContentNotFoundException(
        `Some of the mandatory parties for LetterOfCredit=${contractAddress} are empty. applicant=${applicantStaticId}, beneficiary=${beneficiaryStaticId}, issuing=${issuingBankStaticId}`
      )
    }

    let parties = [applicantStaticId, beneficiaryStaticId, issuingBankStaticId]
    parties = parties.map(party => HashMetaDomain(party))
    const partiesWithoutMyself = this.removeMyselfFromParties(parties)
    return partiesWithoutMyself
  }
}
