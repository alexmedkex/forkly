import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'

import { BINDINGS } from '../../inversify/constants'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/Constants'

import { IMessage } from './messages/Message'
import { MessageType } from './MessageTypes'

@injectable()
export class RequestClient {
  publisher: IMessagePublisher

  private readonly logger = getLogger('RequestClient')

  constructor(
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory,
    @inject(BINDINGS.OutboundPublisher) private readonly publisherId: string
  ) {
    this.publisher = this.messagingFactory.createRetryPublisher(this.publisherId)
  }

  public sendCommonRequest(messageType: MessageType, recipientStaticId: string, message: IMessage) {
    return this.sendMessage(messageType, recipientStaticId, message)
  }

  private async sendMessage(routingKey: string, recipientStaticId: string, msg: any) {
    let result

    try {
      result = await this.publisher.publishCritical(routingKey, msg, {
        recipientStaticId
      })
    } catch (err) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.SendMQMessageFailed, {
        recipientStaticId,
        routingKey,
        err
      })

      throw new MessageSendingError(err.message)
    }

    this.logger.info('Successfully sent a credit line message to company.', {
      recipientStaticId,
      key: routingKey,
      messageId: result.messageId
    })
  }
}

// tslint:disable-next-line:max-classes-per-file
export class MessageSendingError extends Error {}
