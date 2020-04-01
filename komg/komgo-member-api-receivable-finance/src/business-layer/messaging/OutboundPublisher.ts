import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { TYPES, VALUES } from '../../inversify'
import { OutboundPublisherError } from '../errors'
import { IReceivableFinanceMessage } from '../types'

@injectable()
export class OutboundPublisher {
  private readonly logger = getLogger('OutboundPublisher')
  private readonly publisher: IMessagePublisher

  constructor(
    @inject(VALUES.OutboundPublisherId) publisherId: string,
    @inject(VALUES.PublishMaxRetries) outboundPublishMaxRetries: number,
    @inject(VALUES.PublishMaxDelay) outboundPublishMaxDelay: number,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory
  ) {
    this.publisher = this.messagingFactory.createRetryPublisher(publisherId, {
      maxRetries: outboundPublishMaxRetries,
      maxDelay: outboundPublishMaxDelay
    })
  }

  /**
   * Sends an update message
   *
   * @param recipientStaticId static ID of the recipient of the message
   * @param outboundMessage message
   * @throws OutboundPublisherError
   */
  public async send<T>(recipientStaticId: string, message: IReceivableFinanceMessage<T>): Promise<string> {
    try {
      const result = await this.publisher.publishCritical(message.messageType, message, {
        recipientStaticId
      })
      return result.messageId
    } catch (e) {
      const msg = 'Failed to send message'
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.OutboundPublishFailed, msg, {
        errorMessage: e.message
      })

      throw new OutboundPublisherError(msg)
    }
  }
}
