import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
// tslint:disable-next-line:no-submodule-imports
import { IMessageOptions } from '@komgo/messaging-library/dist/types'
import { IDocumentReceivedMessage } from '@komgo/messaging-types'
import { inject, injectable } from 'inversify'

import { CONFIG_KEYS } from '../../inversify/config_keys'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'

@injectable()
export class RabbitMQPublishingClient {
  private readonly logger = getLogger('RabbitMQPublishingClient')
  private readonly publisher: IMessagePublisher

  constructor(
    @inject(CONFIG_KEYS.ToPublisherId) publisherId: string,
    @inject(CONFIG_KEYS.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory
  ) {
    this.logger.info('Creating a RabbitMQ Publisher', {
      publisherId,
      companyStaticId
    })

    this.publisher = this.messagingFactory.createRetryPublisher(publisherId)
  }

  async sendMessage(routingKey: string, recipientStaticId: string, msg: any): Promise<void> {
    const messageOptions: IMessageOptions = {
      senderStaticId: this.companyStaticId,
      recipientStaticId
    }

    await this.publishMessage(routingKey, msg, messageOptions)
  }

  async sendInternalMessage(routingKey: string, msg: IDocumentReceivedMessage): Promise<void> {
    this.logger.info('Publishing internal message')
    return this.publishMessage(routingKey, msg)
  }

  private async publishMessage(routingKey: string, message: any, options?: IMessageOptions) {
    const publishResult = await this.publisher.publishCritical(routingKey, message, options)

    if (!publishResult.controlFlow) {
      this.logger.warn(ErrorCode.ConnectionInternalMQ, ErrorName.MQBufferFullError, 'RabbitMQ buffer is full', {
        messageId: publishResult.messageId,
        routingKey,
        messageOptions: options,
        errorMessage: 'RabbitMQ buffer is full'
      })

      return
    }

    this.logger.info('Published message', {
      routingKey,
      message,
      result: publishResult
    })
  }
}
