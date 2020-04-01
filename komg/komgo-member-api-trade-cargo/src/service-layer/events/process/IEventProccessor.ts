import { IMessageData } from '../../../business-layer/data/request-messages/IMessageData'

export interface ICommonEventProcessor {
  processEvent(data: any, source: string)
}

export interface IEventProcessor<TData extends IMessageData> extends ICommonEventProcessor {
  processEvent(data: TData, source: string)
}
