import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageReceived } from '@komgo/messaging-library'
import { TradeCargoRoutingKey, ITradeMessage, ICargoMessage } from '@komgo/messaging-types'
import { injectable, inject } from 'inversify'

import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { ReceiveTradeUseCase, ReceiveCargoUseCase } from '../../business-layer/trade-cargo/use-cases'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { Metric, MessageDirection, MessageStatus, FailureType } from '../../Metric'

import { IMessageProcessor } from './IMessageProcessor'

@injectable()
export class TradeCargoMessageProcessor implements IMessageProcessor {
  private readonly logger = getLogger('TradeCargoMessageProcessor')

  constructor(
    @inject(TYPES.ReceiveTradeUseCase) private readonly receiveTradeUseCase: ReceiveTradeUseCase,
    @inject(TYPES.ReceiveCargoUseCase) private readonly receiveCargoUseCase: ReceiveCargoUseCase
  ) {}

  public async process(messageReceived: IMessageReceived) {
    if (!this.isRoutingKeySupported(messageReceived)) {
      messageReceived.reject()
      return
    }
    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Inbound,
      [Metric.TradeCargoType]: messageReceived.routingKey,
      [Metric.MessageStatus]: MessageStatus.Success
    })

    if (messageReceived.routingKey === TradeCargoRoutingKey.TradeUpdated) {
      await this.receiveTradeUseCase.execute(this.getTradeMessage(messageReceived))
    } else if (messageReceived.routingKey === TradeCargoRoutingKey.CargoUpdated) {
      await this.receiveCargoUseCase.execute(this.getCargoMessage(messageReceived))
    }

    messageReceived.ack()
  }

  private getTradeMessage(message: IMessageReceived) {
    const content = message.content as ITradeMessage
    if (content && content.trade) {
      return content
    }
    this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.InvalidTradeUpdatedMessagePayload, { content })
    throw new InvalidPayloadProcessingError('Message content is invalid')
  }

  private getCargoMessage(message: IMessageReceived) {
    const content = message.content as ICargoMessage
    if (content && content.cargo) {
      return content
    }
    this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.InvalidCargoUpdatedMessagePayload, { content })
    throw new InvalidPayloadProcessingError('Message content is invalid')
  }

  private isRoutingKeySupported(messageReceived: IMessageReceived): boolean {
    // @ts-ignore
    const isRoutingKeyValid = Object.values(TradeCargoRoutingKey).includes(messageReceived.routingKey)
    if (!isRoutingKeyValid) {
      this.logger.warn(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.UnsupportedTradeCargoMessageTypeError, {
        messageId: messageReceived.options.messageId
      })
    }
    return isRoutingKeyValid
  }
}
