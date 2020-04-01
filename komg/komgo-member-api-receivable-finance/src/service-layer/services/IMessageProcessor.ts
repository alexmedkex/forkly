import { IMessageReceived } from '@komgo/messaging-library'

export interface IMessageProcessor {
  process(message: IMessageReceived)
}
