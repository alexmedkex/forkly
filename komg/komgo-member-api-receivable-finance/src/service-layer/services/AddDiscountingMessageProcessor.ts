import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageReceived } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'

import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX } from '../../business-layer/messaging/constants'
import { ReceiveAddDiscountingMessageUseCaseFactory } from '../../business-layer/messaging/ReceiveAddDiscountingMessageUseCaseFactory'
import { AddDiscountingRequestType } from '../../business-layer/messaging/types/AddDiscountingRequestType'
import { IReceivableFinanceMessage, IAddDiscountingPayload } from '../../business-layer/types'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify'
import { FailureType, MessageDirection, Metric, MessageStatus } from '../../Metric'

import { IMessageProcessor } from './IMessageProcessor'

@injectable()
export class AddDiscountingMessageProcessor implements IMessageProcessor {
  private readonly logger = getLogger('AddDiscountingMessageProcessor')

  constructor(
    @inject(TYPES.ReceiveAddDiscountingMessageUseCaseFactory)
    private readonly receiveAddDiscountingMessageUseCaseFactory: ReceiveAddDiscountingMessageUseCaseFactory
  ) {}

  public async process(msg: IMessageReceived) {
    this.logger.info('Processing add discounting request')
    if (!msg.routingKey.startsWith(ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX)) {
      this.throwInvalidPayloadProcessingError(
        'Unsupported routing key',
        ErrorName.UnsupportedAddDiscoutingMessageType,
        FailureType.UnsupportedRoutingKey,
        {
          messageId: msg.options.messageId,
          routingKey: msg.routingKey
        }
      )
    }

    const content = this.getValidContent(msg)
    const addDiscountingRequestType = content.messageType.split('.')[3] as AddDiscountingRequestType
    const useCase = this.receiveAddDiscountingMessageUseCaseFactory.getUseCase(addDiscountingRequestType)

    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.MessageType]: Metric.AddDiscountingRequestReceived,
      [Metric.MessageStatus]: MessageStatus.Success
    })
    await useCase.execute(content)
    msg.ack()
    this.logger.info('Successfully processed add discounting request')
  }

  private getValidContent(msg: IMessageReceived): IReceivableFinanceMessage<IAddDiscountingPayload<any>> {
    const messageType = this.getAddDiscountingMessageType(msg)
    const content = msg.content as IReceivableFinanceMessage<IAddDiscountingPayload<any>>
    if (!content || !content.data) {
      this.throwInvalidPayloadProcessingError(
        'Message payload is invalid',
        ErrorName.InvalidAddDiscountingMessagePayload,
        FailureType.InvalidMessagePayload,
        {
          content
        }
      )
    }

    if (messageType === AddDiscountingRequestType.Add) {
      if (!content.data.entry || !content.data.reply) {
        this.throwInvalidPayloadProcessingError(
          'Message content is invalid',
          ErrorName.InvalidAddDiscountingRequestMessagePayload,
          FailureType.InvalidMessagePayload,
          {
            content
          }
        )
      }
    }

    return content
  }

  private getAddDiscountingMessageType(msg: IMessageReceived): AddDiscountingRequestType {
    return AddDiscountingRequestType[msg.routingKey.split('.')[3]]
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
      [Metric.MessageType]: Metric.AddDiscountingRequestReceived,
      [Metric.MessageStatus]: MessageStatus.Failed,
      [Metric.FailureType]: type
    })
    throw new InvalidPayloadProcessingError(msg)
  }
}
