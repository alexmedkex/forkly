import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../inversify/types'
import { IEventMessagePublisher } from './IEventMessagePublisher'
import { ITrade, ICargo } from '@komgo/types'
import { ITradeMessage, ICargoMessage, TradeCargoRoutingKey } from '@komgo/messaging-types'
import { VALUES } from '../../inversify/values'

@injectable()
export class EventMessagePublisher implements IEventMessagePublisher {
  private publisher: IMessagePublisher

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory,
    @inject(VALUES.TradeCargoPublisherId) publisherId: string
  ) {
    this.publisher = messagingFactory.createPublisher(publisherId)
  }

  async publishTradeUpdated(trade: ITrade): Promise<string> {
    const message: ITradeMessage = { trade: { ...trade, vaktId: trade.sourceId } }
    const result = await this.publisher.publish(TradeCargoRoutingKey.TradeUpdated, message)
    return result.messageId
  }

  async publishCargoUpdated(cargo: ICargo): Promise<string> {
    const message: ICargoMessage = { cargo: { ...cargo, vaktId: cargo.sourceId } }
    const result = await this.publisher.publish(TradeCargoRoutingKey.CargoUpdated, message)
    return result.messageId
  }
}
