import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IEmail } from '@komgo/types'
import { AmqpConnectionManager } from 'amqp-connection-manager'
import { Message, Channel } from 'amqplib'

import { MailSender } from '../utils/mailSender'
const logger = getLogger('emailInboundRouter')

// mq msg format:
// RK : komgo.email-notification
// header recipient-platform: email-notification
// body
// @komgo/types/IEmail

export const INBOUND_EMAIL_ROUTER_INFO_MESSAGES = {
  NULL_MESSAGE: 'Message is null - previous consumer was cancelled.',
  INVALID_EMAIL_MSG_FORMAT: 'Invalid email body mq format',
  EMAIL_SENDING_ERROR: 'Error while sending email.',
  INVALID_LAST: 'Last message was faulty, rejecting it...'
}

export const inboundEmailRouter = async (manager: AmqpConnectionManager) => {
  // this variable exists to avoid using .reject on a dead channel
  // in case if message causes channel disconnect, this variable is changed to true
  // it means that last message was faulty and it needs to be rejected after reconnect
  let lastMessageWasFaulty = false
  const mailSender = new MailSender()
  await mailSender.transporterSetup()

  const setupChannel = (channel: Channel) => {
    return async (msg: Message) => {
      let emailPayload: IEmail
      if (!msg) {
        // http://www.squaremobius.net/amqp.node/channel_api.html#channel_consume:
        // It says "If the consumer is cancelled by RabbitMQ, the message callback will be invoked with null."
        logger.error(ErrorCode.UnexpectedError, INBOUND_EMAIL_ROUTER_INFO_MESSAGES.NULL_MESSAGE)
        return
      }

      // Rejecting last message after channel was closed:
      if (lastMessageWasFaulty) {
        lastMessageWasFaulty = false
        logger.error(ErrorCode.UnexpectedError, INBOUND_EMAIL_ROUTER_INFO_MESSAGES.INVALID_LAST)
        channel.reject(msg, false)
        return
      }

      try {
        emailPayload = JSON.parse(msg.content.toString()) as IEmail
      } catch (err) {
        logger.error(ErrorCode.UnexpectedError, INBOUND_EMAIL_ROUTER_INFO_MESSAGES.INVALID_EMAIL_MSG_FORMAT, {
          stacktrace: err.stack,
          error: err.message || err.toString()
        })
        lastMessageWasFaulty = true
        return
      }
      try {
        await mailSender.send(emailPayload)
        channel.ack(msg)
        logger.info(`Email sent...`)
      } catch (err) {
        logger.error(ErrorCode.UnexpectedError, INBOUND_EMAIL_ROUTER_INFO_MESSAGES.EMAIL_SENDING_ERROR, {
          stacktrace: err.stack,
          error: err.message || err.toString()
        })
      }
    }
  }
  manager.createChannel({
    setup: (channel: Channel) => {
      const inboundQueue = `EMAIL-NOTIFICATION-QUEUE`
      channel.consume(inboundQueue, setupChannel(channel))
    }
  })
}
