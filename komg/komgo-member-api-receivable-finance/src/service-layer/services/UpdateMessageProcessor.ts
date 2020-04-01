import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageReceived } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'

import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { ReceiveUpdateMessageFactory } from '../../business-layer/messaging'
import { UpdateType, IReceivableFinanceMessage, IReceiveUpdateUseCase } from '../../business-layer/types'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { Metric, MessageDirection, MessageStatus, FailureType } from '../../Metric'

import { IMessageProcessor } from './IMessageProcessor'

@injectable()
export class UpdateMessageProcessor implements IMessageProcessor {
  private readonly logger = getLogger('UpdateMessageProcessor')

  constructor(
    @inject(TYPES.ReceiveUpdateMessageFactory) private readonly receiveUpdateMessageFactory: ReceiveUpdateMessageFactory
  ) {}

  public async process(messageReceived: IMessageReceived) {
    if (!this.isUpdateRoutingKeySupported(messageReceived)) {
      messageReceived.reject()
      return
    }

    const updateMessageType = this.getUpdateMessageType(messageReceived)

    const useCase: IReceiveUpdateUseCase<any> = this.receiveUpdateMessageFactory.getUseCase(updateMessageType)
    const messageContent = this.getMessageContent(messageReceived)

    if (useCase) {
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Inbound,
        [Metric.UpdateMessageType]: updateMessageType,
        [Metric.MessageStatus]: MessageStatus.Success
      })

      await useCase.execute(messageContent)
    } else {
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Inbound,
        [Metric.UpdateMessageType]: updateMessageType,
        [Metric.MessageStatus]: MessageStatus.Failed,
        [Metric.FailureType]: FailureType.InvalidMessagePayload
      })
      const errorName = useCase ? ErrorName.MessageHasNoContent : ErrorName.NoUseCaseForReceivedMessage
      this.logger.warn(ErrorCode.ValidationKomgoInboundAMQP, errorName, {
        messageId: messageReceived.options.messageId,
        updateMessageType
      })
    }
    messageReceived.ack()
  }

  private getMessageContent(message: IMessageReceived) {
    const content = message.content as IReceivableFinanceMessage<any>
    if (content && content.data && content.data.entry) {
      return content
    }
    this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.InvalidUpdatePayload, { content })
    throw new InvalidPayloadProcessingError('Message content is invalid')
  }

  private isUpdateRoutingKeySupported(messageReceived: IMessageReceived): boolean {
    const isRoutingKeyValid = this.getUpdateMessageType(messageReceived) !== undefined
    if (!isRoutingKeyValid) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.UnsupportedUpdateMessageTypeError, {
        messageId: messageReceived.options.messageId
      })
    }
    return isRoutingKeyValid
  }

  private getUpdateMessageType(messageReceived: IMessageReceived): UpdateType {
    return UpdateType[messageReceived.routingKey.split('.')[3]]
  }
}
