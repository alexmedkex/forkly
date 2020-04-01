import { MessageType } from '../MessageTypes'

export interface IMessage {
  version: number
  messageType: MessageType
  context?: any
}
