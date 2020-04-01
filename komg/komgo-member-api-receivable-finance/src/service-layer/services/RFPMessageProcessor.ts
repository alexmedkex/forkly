import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageReceived } from '@komgo/messaging-library'
import { IRFPMessage, IRFPPayload, RFPMessageType } from '@komgo/messaging-types'
import { inject, injectable } from 'inversify'

import { ReceiveMessageUseCaseFactory } from '../../business-layer/messaging'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { FailureType, MessageDirection, MessageStatus, Metric } from '../../Metric'

import { IMessageProcessor } from './IMessageProcessor'

@injectable()
export class RFPMessageProcessor implements IMessageProcessor {
  private readonly logger = getLogger('RFPMessageProcessor')

  constructor(
    @inject(TYPES.ReceiveMessageUseCaseFactory)
    private readonly receiveMessageUseCaseFactory: ReceiveMessageUseCaseFactory
  ) {}

  public async process(messageReceived: IMessageReceived) {
    if (!this.isInternalRoutingKeySupported(messageReceived)) {
      messageReceived.reject()
      return
    }

    const rfpMessageType = this.getRFPMessageType(messageReceived)
    const useCase = this.receiveMessageUseCaseFactory.getUseCase(rfpMessageType)
    const content = messageReceived.content as IRFPMessage<IRFPPayload>

    if (useCase) {
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Inbound,
        [Metric.RFPMessageType]: rfpMessageType,
        [Metric.MessageStatus]: MessageStatus.Success,
        rfpId: content.data!.rfpId
      })

      await useCase.execute(content)
    } else {
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Inbound,
        [Metric.RFPMessageType]: rfpMessageType,
        [Metric.MessageStatus]: MessageStatus.Failed,
        [Metric.FailureType]: FailureType.InvalidMessagePayload,
        rfpId: content.data!.rfpId
      })

      this.logger.warn(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.NoUseCaseForReceivedMessage, {
        messageId: messageReceived.options.messageId,
        rfpMessageType
      })
    }
    messageReceived.ack()
  }

  private isInternalRoutingKeySupported(messageReceived: IMessageReceived): boolean {
    const isRoutingKeyValid = this.getRFPMessageType(messageReceived) !== undefined
    if (!isRoutingKeyValid) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.UnsupportedMessageTypeError, {
        messageId: messageReceived.options.messageId
      })
    }
    return isRoutingKeyValid
  }

  private getRFPMessageType(messageReceived: IMessageReceived): RFPMessageType {
    return RFPMessageType[messageReceived.routingKey.split('.')[4]]
  }
}
