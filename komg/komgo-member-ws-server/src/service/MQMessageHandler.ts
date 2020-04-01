import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IConsumerWatchdog, IMessageReceived } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'
import SocketIO from 'socket.io'

import { TYPES } from '../inversify/types'
import { ErrorName } from '../utils/ErrorName'

import { MQEvent, IContent } from './MQEvent'

const WS_PUBLISHER = 'websocket'
const ROUTING_KEY = 'INTERNAL.WS.*'
const logger = getLogger('MQMessageHandler')

export interface IMQMessageHandler {
  createListener: () => Promise<void>
}

@injectable()
export class MQMessageHandler implements IMQMessageHandler {
  constructor(
    @inject(TYPES.ConsumerWatchdog) private readonly consumerWatchdog: IConsumerWatchdog,
    @inject(TYPES.SocketIO) private readonly io: SocketIO.Server
  ) {}
  createListener(): Promise<void> {
    return this.consumerWatchdog.listen(WS_PUBLISHER, ROUTING_KEY, (message: IMessageReceived) => {
      try {
        const mqEvent = new MQEvent(message.routingKey, message.content as IContent)
        mqEvent.validate()
        message.ack()
        const event = mqEvent.getEventName()
        const recipient = mqEvent.getRecipient()
        this.io.to(recipient).emit(event, mqEvent.getEventBody())
        logger.info(`Successfully emitted ${event} for user: ${recipient}`)
      } catch (error) {
        message.reject()
        logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.unexpectedMessageHandlerError, error.message, {
          stacktrace: error.stack,
          event: {
            routingKey: message.routingKey,
            content: message.content,
            options: {
              messageId: message.options.messageId,
              requestId: message.options.requestId
            }
          }
        })
      }
    })
  }
}
