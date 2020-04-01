import CommonMessageReceived from './CommonMessageReceived'
import { ICommonMessageProperties, IVhostsResponse } from './types'

export default interface ICommonMessagingAgent {
  sendMessage(routingKey: string, recipientExchange: string, message: object, properties: ICommonMessageProperties)
  getMessage(staticId: string): Promise<CommonMessageReceived>
  ackMessage(guid: string): Promise<boolean>
  getVhosts(): Promise<IVhostsResponse>
}
