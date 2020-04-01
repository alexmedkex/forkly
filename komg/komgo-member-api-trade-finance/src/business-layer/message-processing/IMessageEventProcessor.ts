import { IMessageReceived } from '@komgo/messaging-library'

export interface IMessageEventProcessor {
  getKeysToProcess(): Promise<string[]>
  processEvent(message: IMessageReceived): Promise<void>
}
