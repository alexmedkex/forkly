import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { AmqpConnectionManager } from 'amqp-connection-manager'
import { Message, Channel } from 'amqplib'

import { checkMNID } from '../utils/check-mnid'
import { ErrorName, ErrorMessage } from '../utils/error'

const logger = getLogger('inboundRouter')

export const inboundRouter = async (partyName: string, manager: AmqpConnectionManager) => {
  // this variable exists to avoid using .reject on a dead channel
  // in case if message causes channel disconnect, this variable is changed to true
  // it means that last message was faulty and it needs to be rejected after reconnect
  let lastMessageWasFaulty = false

  const setupChannel = (channel: Channel) => {
    return async (msg: Message) => {
      if (!msg) {
        // http://www.squaremobius.net/amqp.node/channel_api.html#channel_consume:
        // It says "If the consumer is cancelled by RabbitMQ, the message callback will be invoked with null."
        logger.warn(ErrorCode.ValidationExternalInboundAMQP, ErrorName.NullMessage, ErrorMessage.NullMessage)
        return
      }

      // Rejecting last message after channel was closed:
      if (lastMessageWasFaulty) {
        lastMessageWasFaulty = false
        logger.error(
          ErrorCode.ValidationExternalInboundAMQP,
          ErrorName.InvalidLastMessage,
          ErrorMessage.InvalidLastMessage
        )
        channel.reject(msg, false)
        logger.metric({ InboundMessageRouted: false })
        return
      }

      // Retrieving routing headers:
      const recipientMNID = msg.properties.headers['recipient-mnid']
      const senderMNID = msg.properties.headers['sender-mnid']

      // Validating routing headers:
      if (!recipientMNID || !senderMNID) {
        const msgId = msg.properties.messageId
        channel.reject(msg, false)
        logger.error(ErrorCode.ValidationExternalInboundAMQP, ErrorName.InvalidHeaders, ErrorMessage.InvalidHeaders, {
          msgId,
          senderMNID,
          recipientMNID
        })
        logger.metric({ InboundMessageRouted: false })
        return
      }

      // Validating MNID:
      if (!(await checkMNID(recipientMNID))) {
        channel.reject(msg, false)
        logger.error(
          ErrorCode.ValidationExternalInboundAMQP,
          ErrorName.InvalidRecipient,
          ErrorMessage.InvalidRecipient,
          {
            senderMNID,
            recipientMNID
          }
        )
        logger.metric({ InboundMessageRouted: false })
        return
      }

      // Validating exchange:
      const recipientExchange = `${recipientMNID}-EXCHANGE`
      try {
        await channel.checkExchange(recipientExchange)
      } catch (err) {
        logger.error(ErrorCode.ValidationExternalInboundAMQP, ErrorName.InvalidExchange, ErrorMessage.InvalidExchange, {
          senderMNID,
          recipientMNID,
          recipientExchange,
          stacktrace: err.stack,
          error: err.message || err.toString()
        })
        lastMessageWasFaulty = true
        logger.metric({ InboundMessageRouted: false })
        return
      }

      // Adding platform headers:
      const properties = {
        ...msg.properties,
        headers: {
          'sender-platform': partyName.toLowerCase(),
          ...msg.properties.headers
        }
      }

      // Routing:
      try {
        channel.publish(recipientExchange, 'komgo.internal', msg.content, properties)
        channel.ack(msg)
        logger.info(`Routed message for ${recipientExchange}...`)
        logger.metric({ InboundMessageRouted: true })
      } catch (err) {
        logger.metric({ InboundMessageRouted: false })
        logger.error(ErrorCode.ValidationExternalInboundAMQP, ErrorName.InvalidPublish, ErrorMessage.InvalidPublish, {
          senderMNID,
          recipientMNID,
          recipientExchange,
          stacktrace: err.stack,
          error: err.message || err.toString()
        })
      }
    }
  }
  manager.createChannel({
    setup: (channel: Channel) => {
      const inboundQueue = `${partyName}-INBOUND-QUEUE`
      channel.consume(inboundQueue, setupChannel(channel))
    }
  })
}
