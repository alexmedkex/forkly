import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { IRFPMessage } from '@komgo/messaging-types'
import { injectable, inject } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'

@injectable()
export default class InternalPublisher {
  private readonly logger = getLogger('InternalPublisher')
  private readonly publisher: IMessagePublisher

  constructor(
    @inject(VALUES.InternalPublisherId) publisherId: string,
    @inject(VALUES.PublishMaxRetries) publishMaxRetries: number,
    @inject(VALUES.PublishMaxDelay) publishMaxDelay: number,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory
  ) {
    this.publisher = this.messagingFactory.createRetryPublisher(publisherId, {
      maxRetries: publishMaxRetries,
      maxDelay: publishMaxDelay
    })
  }

  /**
   * Send RFP message to internal MS from Actions received from other members
   */
  public async send(routingKey: string, message: IRFPMessage<any>): Promise<string> {
    try {
      const result = await this.publisher.publishCritical(routingKey, message)
      return result.messageId
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.InternalPublishFailed, {
        errorMessage: e.message
      })
      throw e
    }
  }
}
