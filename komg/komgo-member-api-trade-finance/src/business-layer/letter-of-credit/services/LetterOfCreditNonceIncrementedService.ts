import { injectable, inject } from 'inversify'

import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'

import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents/letter-of-credit/ILetterOfCreditDataAgent'
import { ErrorNames } from '../../../exceptions/utils'
import { TYPES } from '../../../inversify'

import { ILetterOfCreditEventService } from './ILetterOfCreditEventService'

@injectable()
export class LetterOfCreditNonceIncrementedService implements ILetterOfCreditEventService {
  private logger = getLogger('LetterOfCreditNonceIncrementedService')
  private readonly dataAgent: ILetterOfCreditDataAgent
  constructor(@inject(TYPES.LetterOfCreditDataAgent) dataAgent: ILetterOfCreditDataAgent) {
    this.dataAgent = dataAgent
  }

  async doEvent(decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing NonceIncremented decodedEvent for LetterOfCredit')
    const contractAddress = rawEvent.address
    const { nonce } = decodedEvent

    try {
      const letterOfCredit = await this.dataAgent.getByContractAddress(contractAddress)
      if (!letterOfCredit) {
        throw new Error('Letter of credit not found')
      }
      letterOfCredit.nonce = nonce
      this.logger.info(`About to update nonce ${nonce}, static id ${letterOfCredit.staticId}`)
      await this.dataAgent.update({ staticId: letterOfCredit.staticId }, letterOfCredit)
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.LetterOfCreditNonceIncrementedServiceDoEventFailed, {
        stackTrace: new Error().stack,
        errorObject: error
      })
    }
  }
}
