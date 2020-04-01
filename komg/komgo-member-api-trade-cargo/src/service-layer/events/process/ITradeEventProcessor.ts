import { IEventProcessor } from './IEventProccessor'
import { ITradeMessageData } from '../../../business-layer/data/request-messages/ITradeMessageData'

export interface ITradeEventProcessor extends IEventProcessor<ITradeMessageData> {
  processEvent(message: ITradeMessageData, source: string)
}
