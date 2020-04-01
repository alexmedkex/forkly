import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import { Metric, MessageDirection, MessageStatus, FailureType } from '../../Metrics'

import { IRFPActionMessage, IActionPayload } from './types'

@injectable()
export default class OutboundPublisher {
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
   * Send RFP message to another Komgo member
   */
  public async send(recipientStaticId: string, message: IRFPActionMessage<IActionPayload>): Promise<string> {
    try {
      const result = await this.publisher.publishCritical(message.messageType, message, {
        recipientStaticId
      })
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Outbound,
        [Metric.MessageType]: message.messageType,
        [Metric.MessageStatus]: MessageStatus.Success,
        rfpId: message.data.rfp.rfpId
      })
      return result.messageId
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.OutboundPublishFailed, {
        errorMessage: e.message
      })
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Outbound,
        [Metric.MessageType]: message.messageType,
        [Metric.MessageStatus]: MessageStatus.Failed,
        [Metric.FailureType]: FailureType.OutboundPublishFailed,
        rfpId: message.data.rfp.rfpId
      })
      throw e
    }
  }
}
