import { ILetterOfCreditEventService } from './ILetterOfCreditEventService'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TYPES, CONFIG } from '../../../inversify'
import { LetterOfCreditStatus, ILetterOfCredit, LetterOfCreditType, IDataLetterOfCredit } from '@komgo/types'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents/letter-of-credit/ILetterOfCreditDataAgent'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { soliditySha3, HashMetaDomain } from '../../common/HashFunctions'
import { removeNullsAndUndefined } from '../../../business-layer/util'
import { ILetterOfCreditPartyActionProcessor } from '../processors/ILetterOfCreditPartyActionProcessor'

@injectable()
export class LetterOfCreditCreatedService implements ILetterOfCreditEventService {
  private logger = getLogger('LetterOfCreditService')
  private letterOfCreditPartyActionsProcessor: ILetterOfCreditPartyActionProcessor

  constructor(
    @inject(CONFIG.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.LetterOfCreditDataAgent) private readonly dataAgent: ILetterOfCreditDataAgent,
    @inject(TYPES.LetterOfCreditPartyActionProcessor)
    letterOfCreditPartyActionsProcessor: ILetterOfCreditPartyActionProcessor
  ) {
    this.letterOfCreditPartyActionsProcessor = letterOfCreditPartyActionsProcessor
  }

  async doEvent(decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing LetterOfCreditCreated decodedEvent')
    const contractAddress = rawEvent.address
    const transactionHash = rawEvent.transactionHash
    const { hashedData, creatorGuid } = decodedEvent

    try {
      const lcResult: ILetterOfCredit<IDataLetterOfCredit> = await this.dataAgent.getByTransactionHash(transactionHash)
      if (!lcResult) {
        await this.verifyConsistencyInApplicantDB(creatorGuid)
        await this.saveLetterOfCreditAsRequestedVerificationPending(contractAddress, transactionHash, hashedData)
        return
      }

      this.logger.info(`About to update Letter of Credit', with address=${contractAddress}}`, {
        LetterOfCreditAddress: contractAddress,
        transactionHash
      })

      if (this.isDataHashValid(lcResult, hashedData)) {
        await this.saveLetterOfCreditAsRequested(lcResult, contractAddress)
        lcResult.status = LetterOfCreditStatus.Requested
        await this.letterOfCreditPartyActionsProcessor.executePartyActions(lcResult)
      } else {
        await this.saveLetterOfCreditAsRequestedVerificationFailed(lcResult, contractAddress)
      }
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.LetterOfCreditCreatedServiceDatabaseConnection, {
        stackTrace: new Error().stack
      })
    }
  }

  private async saveLetterOfCreditAsRequested(lcResult: ILetterOfCredit<IDataLetterOfCredit>, contractAddress: string) {
    try {
      await this.dataAgent.update(
        { transactionHash: lcResult.transactionHash },
        {
          contractAddress,
          status: LetterOfCreditStatus.Requested
        }
      )
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.LetterOfCreditCreatedServiceSaveAsRequested, {
        stackTrace: new Error().stack,
        errorObject: error
      })
      throw error
    }
  }

  private async saveLetterOfCreditAsRequestedVerificationFailed(
    lcResult: ILetterOfCredit<IDataLetterOfCredit>,
    contractAddress: string
  ) {
    try {
      this.logger.warn(
        ErrorCode.ValidationKomgoInboundAMQP,
        ErrorNames.LetterOfCreditEventHashInvalid,
        'Letter of credit content hash did not match.'
      )
      await this.dataAgent.update(
        { transactionHash: lcResult.transactionHash },
        {
          contractAddress,
          status: LetterOfCreditStatus.Requested_Verification_Failed
        }
      )
    } catch (error) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LetterOfCreditCreatedServiceSaveAsRequestedVerificationFailed,
        {
          stackTrace: new Error().stack,
          errorObject: error
        }
      )
      throw error
    }
  }

  private async saveLetterOfCreditAsRequestedVerificationPending(
    contractAddress: string,
    transactionHash: string,
    hashedData: string
  ) {
    try {
      const newLetterOfCredit = {
        contractAddress,
        transactionHash,
        hashedData,
        version: 1,
        type: LetterOfCreditType.Standby,
        status: LetterOfCreditStatus.Requested_Verification_Pending
      }

      this.logger.info(`About to update Letter of Credit', with address=${contractAddress}}`, {
        LetterOfCreditAddress: contractAddress,
        transactionHash
      })

      await this.dataAgent.save(newLetterOfCredit as ILetterOfCredit<IDataLetterOfCredit>)
    } catch (error) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LetterOfCreditCreatedServiceSaveAsRequestedVerificationPendingFailed,
        {
          stackTrace: new Error().stack,
          errorObject: error
        }
      )
      throw error
    }
  }

  private async verifyConsistencyInApplicantDB(creatorGuid: string) {
    if (this.isApplicantNode(creatorGuid)) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LetterOfCreditNotFoundAsApplicant,
        'Letter of credit was not found in database. Data is inconsistent.'
      )
      throw new Error(`Letter of credit was not found in applicant ${creatorGuid}database. Data is inconsistent`)
    }
  }

  private isDataHashValid(lcResult, hashedData) {
    const newlcResult = { ...lcResult }
    delete newlcResult.hashedData
    delete newlcResult._id
    delete newlcResult.__v
    delete newlcResult.status
    delete newlcResult.transactionHash
    const lcResultWithoutNulls = removeNullsAndUndefined(newlcResult)
    const lcHashed = soliditySha3(JSON.stringify(lcResultWithoutNulls))

    return lcHashed === hashedData
  }

  private isApplicantNode(guid: string): boolean {
    return HashMetaDomain(this.companyStaticId) === guid
  }
}
