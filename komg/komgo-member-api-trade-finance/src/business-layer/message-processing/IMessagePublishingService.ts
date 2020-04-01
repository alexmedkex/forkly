import { IMessageOptions, IPublishResult } from '@komgo/messaging-library/dist/types'

export interface IMessagePublishingService {
  publish(routingKey: string, content: object, options?: IMessageOptions): Promise<IPublishResult>
}
