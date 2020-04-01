import { inject, injectable } from 'inversify'
import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { IVaktMessage, ILCPayload } from './messageTypes'
import { TYPES } from '../../inversify/types'
import { CONFIG } from '../../inversify/config'

export interface IVaktMessagingManager {
  notify: (message: IVaktMessage<ILCPayload>) => Promise<any>
}

@injectable()
export class VaktMessagingManager implements IVaktMessagingManager {
  private publisher: IMessagePublisher
  private routingkey: string = process.env.OUTBOUND_ROUTING_KEY || 'komgo-internal'

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory | any,
    @inject(CONFIG.PublisherId) private publisherId: string | any
  ) {
    this.publisher = messagingFactory.createRetryPublisher(this.publisherId)
  }

  async notify(message: IVaktMessage<ILCPayload>) {
    return this.publisher.publish(this.routingkey, message.payload, {
      recipientStaticId: message.headers.recipientStaticId,
      recipientPlatform: 'vakt'
    })
  }
}
