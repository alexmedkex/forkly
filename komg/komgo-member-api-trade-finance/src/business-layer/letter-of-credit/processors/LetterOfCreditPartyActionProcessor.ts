import { injectable, inject } from 'inversify'

import { getLogger } from '@komgo/logging'
import { ILetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'

import { ErrorCode } from '@komgo/error-utilities'

import { TYPES } from '../../../inversify'
import { ErrorNames } from '../../../exceptions'

import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'

@injectable()
export class LetterOfCreditPartyActionProcessor implements ILetterOfCreditPartyActionProcessor {
  private readonly logger = getLogger('LetterOfCreditPartyActionProcessor')

  private stateProcessors = new Map<LetterOfCreditStatus, ILetterOfCreditPartyActionProcessor>()

  private readonly onRequestedProcessor: ILetterOfCreditPartyActionProcessor
  private readonly onRequestRejectedProcessor: ILetterOfCreditPartyActionProcessor
  private readonly onIssuedProcessor: ILetterOfCreditPartyActionProcessor

  constructor(
    @inject(TYPES.LetterOfCreditPartyActionProcessorOnRequestRejected)
    onRequestRejectedProcessor: ILetterOfCreditPartyActionProcessor,
    @inject(TYPES.LetterOfCreditPartyActionProcessorOnRequested)
    onRequestedProcessor: ILetterOfCreditPartyActionProcessor,
    @inject(TYPES.LetterOfCreditPartyActionProcessorOnIssued) onIssuedProcessor: ILetterOfCreditPartyActionProcessor
  ) {
    this.onIssuedProcessor = onIssuedProcessor
    this.onRequestedProcessor = onRequestedProcessor
    this.onRequestRejectedProcessor = onRequestRejectedProcessor

    this.stateProcessors.set(LetterOfCreditStatus.Requested, this.onRequestedProcessor)
    this.stateProcessors.set(LetterOfCreditStatus.Issued, this.onIssuedProcessor)
    this.stateProcessors.set(LetterOfCreditStatus.RequestRejected, this.onRequestRejectedProcessor)
  }

  async executePartyActions(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    try {
      const currentState = letterOfCredit.status
      const processor = this.stateProcessors.get(currentState)

      if (!processor) {
        throw new Error(`There is not processor for this state ${currentState}`)
      }

      await processor.executePartyActions(letterOfCredit)
    } catch (error) {
      this.logger.error(
        ErrorCode.UnexpectedError,
        ErrorNames.PartyActionsProcessorFailed,
        `Letter of Credit Party Action Processor Failed`,
        { StaticId: letterOfCredit.staticId, error: error.message },
        new Error().stack
      )
      throw error
    }
  }
}
