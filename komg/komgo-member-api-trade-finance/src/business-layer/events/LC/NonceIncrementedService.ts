import { ILCEventService } from './ILCEventService'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILC } from '../../..//data-layer/models/ILC'

@injectable()
export class NonceIncrementedService implements ILCEventService {
  private logger = getLogger('NonceIncrementedService')

  constructor(@inject(TYPES.LCCacheDataAgent) private readonly cacheDataAgent: ILCCacheDataAgent) {}

  async doEvent(lc: ILC, decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing NonceIncremented decodedEvent')
    const nonce = decodedEvent.nonce

    this.logger.info(`About to update nonce'`, {
      nonce
    })
    await this.cacheDataAgent.updateField(lc._id, 'nonce', nonce)
  }
}
