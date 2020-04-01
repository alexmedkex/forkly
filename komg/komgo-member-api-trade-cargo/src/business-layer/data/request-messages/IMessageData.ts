import { MessageType } from './MessageType'

export interface IMessageData {
  version: number
  messageType: MessageType
  vaktId: string
}
