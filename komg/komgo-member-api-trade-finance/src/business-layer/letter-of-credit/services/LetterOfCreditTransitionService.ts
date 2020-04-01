import { injectable, inject } from 'inversify'

import { LetterOfCreditStatus, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents/letter-of-credit/ILetterOfCreditDataAgent'
import { ErrorNames } from '../../../exceptions/utils'
import { TYPES } from '../../../inversify'
import { soliditySha3 } from '../../common/HashFunctions'
import { LetterOfCreditContractStatus } from '../events/LetterOfCreditEvents'
import { removeNullsAndUndefined } from '../../../business-layer/util'

import { ILetterOfCreditPartyActionProcessor } from '../processors/ILetterOfCreditPartyActionProcessor'
import { ILetterOfCreditEventService } from './ILetterOfCreditEventService'

@injectable()
export class LetterOfCreditTransitionService implements ILetterOfCreditEventService {
  private readonly logger = getLogger('LetterOfCreditTransitionService')
  private readonly partyActionsProcessor: ILetterOfCreditPartyActionProcessor
  private readonly dataAgent: ILetterOfCreditDataAgent
  private transitionProcessors = {}

  constructor(
    @inject(TYPES.LetterOfCreditDataAgent) dataAgent: ILetterOfCreditDataAgent,
    @inject(TYPES.LetterOfCreditPartyActionProcessor) partyActionsProcessor: ILetterOfCreditPartyActionProcessor
  ) {
    this.dataAgent = dataAgent
    this.partyActionsProcessor = partyActionsProcessor
    this.transitionProcessors[LetterOfCreditContractStatus.ISSUED] = this.issuedProcessor.bind(this)
    this.transitionProcessors[LetterOfCreditContractStatus.REQUEST_REJECTED] = this.requestRejectedProcessor.bind(this)
  }

  async doEvent(decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing LetterOfCreditTransitionService decodedEvent')
    const contractAddress = rawEvent.address
    const { stateId } = decodedEvent
    const processor = this.transitionProcessors[stateId]

    if (!processor) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.LetterOfCreditTransitionEventProcessorNotFound,
        'Letter Of Credit Transition event processor not found',
        {
          decodedEvent,
          rawEvent,
          contractAddress
        },
        new Error().stack
      )
      return
    }

    try {
      const lcResult: ILetterOfCredit<IDataLetterOfCredit> = await this.dataAgent.getByContractAddress(contractAddress)
      if (!lcResult) {
        this.logger.error(
          ErrorCode.DatabaseMissingData,
          ErrorNames.LetterOfCreditNotFoundInTransitionService,
          'Letter of credit was not found in database. Data is inconsistent.'
        )
        throw new Error(`Letter of credit was not found in database. Data is inconsistent`)
      }

      await processor(lcResult, decodedEvent)
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.LetterOfCreditCreatedServiceDatabaseConnection, {
        stackTrace: new Error().stack
      })
    }
  }

  private async requestRejectedProcessor(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, decodedEvent: any) {
    this.logger.info('Letter Of Credit was rejected by issuing bank, updating status', {
      staticId: letterOfCredit.staticId
    })

    if (letterOfCredit.status === LetterOfCreditStatus.RequestRejected_Pending) {
      letterOfCredit.status = LetterOfCreditStatus.RequestRejected
    } else if (letterOfCredit.status === LetterOfCreditStatus.Requested) {
      letterOfCredit.status = LetterOfCreditStatus.RequestRejected_Pending
    }

    await this.dataAgent.update({ staticId: letterOfCredit.staticId }, letterOfCredit)

    this.logger.info('Letter of credit state updated', {
      sblcStaticId: letterOfCredit.staticId
    })

    if (letterOfCredit.status === LetterOfCreditStatus.RequestRejected) {
      await this.partyActionsProcessor.executePartyActions(letterOfCredit)
    }
  }

  private async issuedProcessor(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, decodedEvent: any) {
    this.logger.info('Letter of credit was issued, updating status', {
      staticId: letterOfCredit.staticId
    })

    if (letterOfCredit.status === LetterOfCreditStatus.Issued_Verification_Pending) {
      if (this.isDataHashValid(letterOfCredit, decodedEvent._dataHash)) {
        letterOfCredit.status = LetterOfCreditStatus.Issued
      } else {
        letterOfCredit.status = LetterOfCreditStatus.Issued_Verification_Failed
        this.logger.warn(
          ErrorCode.ValidationKomgoInboundAMQP,
          ErrorNames.LetterOfCreditIssuedEventHashInvalid,
          'Letter of credit content hash did not match.'
        )
      }
    } else if (letterOfCredit.status === LetterOfCreditStatus.Requested) {
      letterOfCredit.status = LetterOfCreditStatus.Issued_Verification_Pending
    }

    await this.dataAgent.update({ staticId: letterOfCredit.staticId }, letterOfCredit)

    this.logger.info('Letter of credit state updated', {
      staticId: letterOfCredit.staticId
    })

    if (letterOfCredit.status === LetterOfCreditStatus.Issued) {
      await this.partyActionsProcessor.executePartyActions(letterOfCredit)
    }
  }

  private isDataHashValid(lcResult, hashedData) {
    const newlcResult = { ...lcResult }
    delete newlcResult.hashedData
    delete newlcResult.status
    delete newlcResult.updatedAt
    const lcResultWithoutNulls = removeNullsAndUndefined(newlcResult)
    this.logger.info('issuedProcessor lc before hash' + JSON.stringify(newlcResult))
    const lcHashed = soliditySha3(JSON.stringify(lcResultWithoutNulls))
    return lcHashed === hashedData
  }
}
