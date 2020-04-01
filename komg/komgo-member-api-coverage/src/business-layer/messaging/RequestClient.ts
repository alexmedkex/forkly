import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import { getLogger } from '@komgo/logging'
import CounterpartyRequestMessage from './messages/CounterpartyRequestMessage'
import { MESSAGE_TYPE, MessageType } from './MessageTypes'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { Metric, MetricAction, MetricState } from '../../utils/Metrics'

@injectable()
export class RequestClient {
  publisher: IMessagePublisher

  private readonly logger = getLogger('RequestClient')

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory,
    @inject('outbound-publisher') publisherId: string
  ) {
    this.publisher = messagingFactory.createRetryPublisher(publisherId)
  }

  public sendCommonRequest(messageType: MessageType, recipientStaticId: string, request: CounterpartyRequestMessage) {
    return this.sendMessage(messageType, recipientStaticId, request)
  }

  private async sendMessage(routingKey: string, recipientStaticId: string, msg: any) {
    let result

    try {
      result = await this.publisher.publishCritical(routingKey, msg, {
        recipientStaticId
      })
    } catch (err) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.ReceiveMsgInternalMQFailed, {
        recipientStaticId,
        routingKey,
        err
      })

      throw new MessageSendingError(err.message)
    }

    if (!result.controlFlow) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.InternalMQBufferIsFullFailed)
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.ReceiveMsgInternalMQFailed, {
        recipientStaticId,
        routingKey
      })

      throw new MessageSendingError('Failed to publish counterparty request')
    }
    this.logger.info('Successfully sent a counterparty request to company.', {
      recipientStaticId,
      key: routingKey,
      messageId: result.messageId
    })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyRequestSent],
      [Metric.State]: [MetricState.Success]
    })
  }
}

// tslint:disable-next-line:max-classes-per-file
export class MessageSendingError extends Error {}
