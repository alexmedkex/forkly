import { injectable, inject } from 'inversify'
import { TYPES } from '../../inversify/types'
import { CONFIG } from '../../inversify/config'
import { IMessagePublishingService } from './IMessagePublishingService'
import MQConnectionException from '../../exceptions/MQConnectionException'
import { ErrorNames } from '../../exceptions/utils'

import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'
import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { IMessageOptions, IPublishResult } from '@komgo/messaging-library/dist/types'

@injectable()
export class MessagePublishingService implements IMessagePublishingService {
  private publisher: IMessagePublisher
  private logger = getLogger('MessagePublishingService')

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory,
    @inject(CONFIG.PublisherId) publisherId: string
  ) {
    this.publisher = messagingFactory.createRetryPublisher(publisherId)
  }

  public async publish(routingKey: string, content: object, options?: IMessageOptions): Promise<IPublishResult> {
    try {
      return this.publisher.publish(routingKey, content, options)
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorNames.PublishMessageFailed, 'Failed to publish message.', {
        routingKey,
        content
      })
      throw new MQConnectionException(`Failed to publish message. ${error.message}`)
    }
  }
}
