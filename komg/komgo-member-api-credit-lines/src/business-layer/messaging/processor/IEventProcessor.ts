import { IMessage } from '../messages/Message'
import { MessageType } from '../MessageTypes'

export interface IEventProcessorBase {
  messageType: MessageType
  processMessage(messageData: IMessage)
  shouldProcess(messageData: IMessage)
}

export interface IEventProcessor<T extends IMessage> extends IEventProcessorBase {
  processMessage(eventData: T): Promise<boolean>
}
