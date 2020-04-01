import { getLogger } from '@komgo/logging'
import { ITrade } from '@komgo/types'
import { TYPES } from '../inversify/types'
import { IEventMessagePublisher } from '../service-layer/events/IEventMessagePublisher'
import { inject, injectable } from 'inversify'
import * as _ from 'lodash'

@injectable()
export class TradeUpdateMessageUseCase {
  private readonly logger = getLogger('TradeUpdateMessageUseCase')

  constructor(@inject(TYPES.EventMessagePublisher) private readonly eventMessagePublisher: IEventMessagePublisher) {}

  public async execute(oldTrade: ITrade, newTrade: ITrade) {
    if (!_.isEqual(this.clearTrade(oldTrade), this.clearTrade(newTrade))) {
      const messageId = await this.eventMessagePublisher.publishTradeUpdated(newTrade)
      this.logger.info('Trade updated message published', {
        sourceId: newTrade.sourceId,
        messageId
      })
    }
  }

  private clearTrade(trade: ITrade) {
    return { ...trade, updatedAt: undefined, __v: undefined }
  }
}
