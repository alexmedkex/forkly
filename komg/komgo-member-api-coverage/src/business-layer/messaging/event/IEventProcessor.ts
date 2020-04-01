import { MESSAGE_TYPE } from '../MessageTypes'

export interface IEventProcessorBase {
  messageType: MESSAGE_TYPE
  processEvent(eventData: any)
}

export interface IEventProcessor<T> extends IEventProcessorBase {
  processEvent(eventData: T): Promise<boolean>
}
