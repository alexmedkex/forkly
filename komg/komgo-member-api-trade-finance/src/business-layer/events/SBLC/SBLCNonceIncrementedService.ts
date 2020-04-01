import { ISBLCEventService } from './ISBLCEventService'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { IStandbyLetterOfCredit } from '@komgo/types'

@injectable()
export class SBLCNonceIncrementedService implements ISBLCEventService {
  private logger = getLogger('SBLCNonceIncrementedService')

  constructor(@inject(TYPES.SBLCDataAgent) private readonly cacheDataAgent: ISBLCDataAgent) {}

  async doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing NonceIncremented decodedEvent for SBLC')
    const nonce = decodedEvent.nonce
    sblc.nonce = nonce
    try {
      this.logger.info(`About to update nonce ${nonce}, static id ${sblc.staticId}`)
      await this.cacheDataAgent.update({ staticId: sblc.staticId }, sblc)
    } catch (error) {
      this.logger.info('Error processing NonceIncremented for SBLC', {
        error: 'NonceIncrementedEventProcessingFailed',
        errorObject: error
      })
    }
  }
}
