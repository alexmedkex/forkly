import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageReceived } from '@komgo/messaging-library'
import { DocumentRoutingKeyPrefix, IDocumentReceivedMessage } from '@komgo/messaging-types'
import { injectable, inject } from 'inversify'

import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { PRODUCT_ID } from '../../constants'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify'
import { Metric, MessageDirection, MessageStatus, FailureType } from '../../Metric'

import { IMessageProcessor } from './IMessageProcessor'

@injectable()
export class DocumentMessageProcessor implements IMessageProcessor {
  private readonly logger = getLogger('DocumentMessageProcessor')

  constructor(
    @inject(TYPES.DocumentReceivedUseCase)
    private readonly documentReceivedUseCase
  ) {}

  public async process(messageReceived: IMessageReceived) {
    if (!messageReceived.routingKey.startsWith(`${DocumentRoutingKeyPrefix.DocumentReceived}.${PRODUCT_ID}`)) {
      this.throwInvalidPayloadProcessingError(
        'Unsupported routing key',
        ErrorName.UnsupportedDocumentMessageType,
        FailureType.UnsupportedRoutingKey,
        {
          messageId: messageReceived.options.messageId,
          routingKey: messageReceived.routingKey
        }
      )
    }
    const messageContent = this.getMessageContent(messageReceived)
    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.MessageType]: Metric.DocumentReceived,
      [Metric.MessageStatus]: MessageStatus.Success
    })
    await this.documentReceivedUseCase.execute(messageContent)
    messageReceived.ack()
  }

  private getMessageContent(message: IMessageReceived) {
    const content = message.content as IDocumentReceivedMessage
    this.validate(content)
    return content
  }

  private validate(content: IDocumentReceivedMessage): void {
    if (
      !content ||
      !content.context ||
      !content.context.productId ||
      !content.documents ||
      content.documents.length === 0 ||
      !content.senderStaticId
    ) {
      this.throwInvalidPayloadProcessingError(
        'Message content is invalid',
        ErrorName.InvalidDocumentMessagePayload,
        FailureType.InvalidMessagePayload,
        {
          content
        }
      )
    }
  }

  private throwInvalidPayloadProcessingError(
    msg: string,
    errorName: ErrorName,
    type: FailureType,
    ...loggerArgs: any[]
  ) {
    this.logger.error(ErrorCode.ValidationInternalAMQP, errorName, msg, ...loggerArgs)
    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.MessageType]: Metric.DocumentReceived,
      [Metric.MessageStatus]: MessageStatus.Failed,
      [Metric.FailureType]: type
    })
    throw new InvalidPayloadProcessingError(msg)
  }
}
