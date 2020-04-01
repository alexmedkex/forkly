import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { MessagingFactory, IConsumerWatchdog, IMessageReceived } from '@komgo/messaging-library'
import { ActionType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import FailedProcessActionError from '../../business-layer/errors/FailedProcessActionError'
import InvalidActionReplyError from '../../business-layer/errors/InvalidActionReplyError'
import InvalidDataError from '../../business-layer/errors/InvalidDataError'
import RFPNotFoundError from '../../business-layer/errors/RFPNotFoundError'
import AbstractReceiveInboundUseCase from '../../business-layer/inbound-actions/AbstractReceiveInboundUseCase'
import InboundUseCaseFactory from '../../business-layer/inbound-actions/InboundUseCaseFactory'
import { OUTBOUND_MESSAGE_TYPE_PREFIX } from '../../business-layer/messaging/constants'
import InvalidActionTypeError from '../../business-layer/messaging/InvalidActionTypeError'
import InvalidMessageTypeError from '../../business-layer/messaging/InvalidMessageTypeError'
import { IRFPActionMessage, IActionPayload } from '../../business-layer/messaging/types'
import { buildMessageType, getActionType } from '../../business-layer/messaging/utils'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import { Metric, FailureType, MessageDirection, MessageStatus } from '../../Metrics'

const REDACTED_CONTENT = '[redacted]'

@injectable()
export default class InboundProcessorService {
  private readonly logger = getLogger('InboundProcessorService')
  private readonly consumer: IConsumerWatchdog

  constructor(
    @inject(VALUES.InboundConsumerId) inboundConsumerId: string,
    @inject(VALUES.InboundConsumeRetryDelay) inboundConsumeRetryDelay: number,
    @inject(VALUES.InboundPublisherId) private readonly inboundPublisherId: string,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory,
    @inject(TYPES.ReceiveInboundUseCaseFactory)
    private readonly inboundUseCaseFactory: InboundUseCaseFactory
  ) {
    this.consumer = this.messagingFactory.createConsumerWatchdog(inboundConsumerId, inboundConsumeRetryDelay)
  }

  public async start() {
    await this.consumer.listen(
      this.inboundPublisherId,
      this.createRoutingKeyListen(),
      async (messageReceived: IMessageReceived) => {
        try {
          this.logger.info('Message received', {
            message: { ...messageReceived, content: REDACTED_CONTENT }
          })
          if (!this.isRoutingKeySupported(messageReceived)) {
            messageReceived.reject()
            this.metricLogMessageFailed(messageReceived.routingKey, FailureType.InvalidMessageType)
            return
          }
          const message = messageReceived.content as IRFPActionMessage<IActionPayload>

          if (!this.isReceipientStaticIDValid(message, messageReceived)) {
            messageReceived.reject()
            this.metricLogMessageFailed(message.messageType, FailureType.InvalidRecipient, message.data.rfp.rfpId)
            return
          }
          const actionType = getActionType(message.messageType) // throws InvalidMessageTypeError or InvalidActionTypeError

          const usecase: AbstractReceiveInboundUseCase = this.inboundUseCaseFactory.getUseCase(actionType)
          await usecase.execute(message, actionType)

          this.metricLogMessageSuccess(message)
          this.logger.info('ACK message', {
            message: { ...messageReceived, content: REDACTED_CONTENT }
          })
          messageReceived.ack()
        } catch (error) {
          this.handleError(messageReceived, error)
        }
      }
    )
  }

  public async stop() {
    await this.consumer.close()
  }

  private metricLogMessageFailed(messageType: string, failureType: FailureType, rfpId?: string) {
    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.MessageType]: messageType,
      [Metric.MessageStatus]: MessageStatus.Failed,
      [Metric.FailureType]: failureType,
      rfpId
    })
  }

  private metricLogMessageSuccess(message: IRFPActionMessage<IActionPayload>) {
    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.MessageStatus]: MessageStatus.Success,
      [Metric.MessageType]: message.messageType,
      rfpId: message.data.rfp.rfpId
    })
  }

  private handleError(messageReceived: IMessageReceived, error: any) {
    if (error instanceof InvalidMessageTypeError || error instanceof InvalidActionTypeError) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.InvalidActionMessageTypeError, error.message, {
        message: { ...messageReceived, content: REDACTED_CONTENT }
      })
      messageReceived.reject()
    } else if (
      error instanceof FailedProcessActionError ||
      error instanceof InvalidDataError ||
      error instanceof RFPNotFoundError ||
      error instanceof InvalidActionReplyError
    ) {
      this.logger.crit(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.InvalidInboundActionStateError, error.message, {
        message: { ...messageReceived, content: REDACTED_CONTENT, rfpId: error.rfpId }
      })
      messageReceived.reject()
    } else {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.InboundMessageProcessFailed, {
        message: { ...messageReceived, content: REDACTED_CONTENT }
      })
      messageReceived.requeue()
    }
  }

  private isReceipientStaticIDValid(
    message: IRFPActionMessage<IActionPayload>,
    messageReceived: IMessageReceived
  ): boolean {
    const isReceipientStaticIDValid = message.data.rfp.recipientStaticID === this.companyStaticId
    if (!isReceipientStaticIDValid) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.InvalidRecipientStatidIdError, {
        messageId: messageReceived.options.messageId,
        rfpMessage: { ...message, data: REDACTED_CONTENT },
        rfpData: message.data.rfp
      })
    }
    return isReceipientStaticIDValid
  }

  private isRoutingKeySupported(messageReceived: IMessageReceived): boolean {
    const isRoutingKeyValid =
      messageReceived.routingKey === buildMessageType(ActionType.Request) ||
      messageReceived.routingKey === buildMessageType(ActionType.Response) ||
      messageReceived.routingKey === buildMessageType(ActionType.Reject) ||
      messageReceived.routingKey === buildMessageType(ActionType.Accept) ||
      messageReceived.routingKey === buildMessageType(ActionType.Decline)
    if (!isRoutingKeyValid) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.UnsupportedInboundMessageTypeError, {
        messageId: messageReceived.options.messageId
      })
    }
    return isRoutingKeyValid
  }

  private createRoutingKeyListen() {
    return `${OUTBOUND_MESSAGE_TYPE_PREFIX}#`
  }
}
