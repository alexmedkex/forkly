import { AMQPUtility, AMQPConfig } from '@komgo/integration-test-utilities'
import { IMockedIds } from './types'

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function setupIntraQueues(id: string, amqpConfig = new AMQPConfig()) {
  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  await channel.assertExchange(`${id}-EXCHANGE`, 'topic')
  await channel.assertExchange(`${id}-EXCHANGE-ACK`, 'topic')

  await channel.assertQueue(`${id}-QUEUE`, {
    deadLetterExchange: `${id}-EXCHANGE-ACK`
  })
  await channel.assertQueue(`${id}-QUEUE-ACK`)

  await channel.bindQueue(`${id}-QUEUE`, `${id}-EXCHANGE`, '#')
  await channel.bindQueue(`${id}-QUEUE-ACK`, `${id}-EXCHANGE-ACK`, '#')

  await connection.close()
}

export const createIntraMQs = async (mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) => {
  await setupIntraQueues(mockedIds.recipientMNID, amqpConfig)
  await setupIntraQueues(mockedIds.senderMNID, amqpConfig)

  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  // VAKT
  await channel.assertExchange(mockedIds.outboundVaktExchange, 'topic')
  await channel.assertQueue(mockedIds.outboundVaktQueue)
  await channel.bindQueue(mockedIds.outboundVaktQueue, mockedIds.outboundVaktExchange, '#')

  // Monitoring - Email-notification
  await channel.assertExchange(mockedIds.outboundMonitoringExchange, 'topic')
  await channel.assertQueue(mockedIds.outboundMonitoringQueue)
  await channel.bindQueue(mockedIds.outboundMonitoringQueue, mockedIds.outboundMonitoringExchange, 'komgo.monitoring')
  await channel.assertQueue(mockedIds.outboundEmailNotificationQueue)
  await channel.bindQueue(
    mockedIds.outboundEmailNotificationQueue,
    mockedIds.outboundMonitoringExchange,
    'komgo.email-notification'
  )

  await connection.close()
}

export const deleteIntraMQs = async (mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) => {
  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  await channel.deleteQueue(`${mockedIds.recipientMNID}-QUEUE`, { ifEmpty: true })
  await channel.deleteQueue(`${mockedIds.senderMNID}-QUEUE`, { ifEmpty: true })
  await channel.deleteQueue(`${mockedIds.recipientMNID}-QUEUE-ACK`, { ifEmpty: true })
  await channel.deleteQueue(`${mockedIds.senderMNID}-QUEUE-ACK`, { ifEmpty: true })
  await channel.deleteQueue(mockedIds.outboundVaktQueue, { ifEmpty: true })
  await channel.deleteQueue(mockedIds.outboundMonitoringQueue, { ifEmpty: true })
  await channel.deleteQueue(mockedIds.outboundEmailNotificationQueue, { ifEmpty: true })

  await channel.deleteExchange(`${mockedIds.recipientMNID}-EXCHANGE`)
  await channel.deleteExchange(`${mockedIds.senderMNID}-EXCHANGE`)
  await channel.deleteExchange(`${mockedIds.recipientMNID}-EXCHANGE-ACK`)
  await channel.deleteExchange(`${mockedIds.senderMNID}-EXCHANGE-ACK`)
  await channel.deleteExchange(mockedIds.outboundVaktExchange)
  await channel.deleteExchange(mockedIds.outboundMonitoringExchange)

  await connection.close()
}

export const deleteInternalMQs = async (mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) => {
  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  await channel.deleteQueue(`${mockedIds.eventConsumerId}.${mockedIds.eventToPublisherId}.queue`, {
    ifEmpty: true
  })
  await channel.deleteQueue(`${mockedIds.eventToPublisherId}.dead`, { ifEmpty: true })
  await channel.deleteQueue(`${mockedIds.eventFromPublisherId}.dead`, { ifEmpty: true })

  await channel.deleteExchange(mockedIds.eventToPublisherId)
  await channel.deleteExchange(mockedIds.eventFromPublisherId)
  await channel.deleteExchange(`${mockedIds.eventToPublisherId}.dead`)
  await channel.deleteExchange(`${mockedIds.eventFromPublisherId}.dead`)

  await connection.close()
}

export const createMockedIds: () => IMockedIds = () => {
  const eventFromPublisherId = generateRandomString(7, 'from-event-mgnt-')
  const eventToPublisherId = generateRandomString(7, 'to-event-mgnt-')
  return {
    recipientMNID: generateRandomString(7, 'recipientBank'),
    senderMNID: generateRandomString(7, 'senderBank'),
    eventConsumerId: generateRandomString(7, 'event-mgnt-consumer-'),
    eventFromPublisherId,
    eventToPublisherId,
    companyStaticId: generateRandomString(7, 'recipientBankStaticId'),
    outboundRoutingKey: generateRandomString(7, 'outboundRoutingKey'),
    outboundVaktExchange: generateRandomString(7, 'outboundVaktExchange'),
    outboundVaktQueue: generateRandomString(7, 'outboundVaktQueue'),
    outboundMonitoringExchange: generateRandomString(7, 'outboundMonitoringExchange'),
    outboundMonitoringQueue: generateRandomString(7, 'outboundMonitoringQueue'),
    outboundEmailNotificationQueue: generateRandomString(7, 'outboundEmailNotificationQueue'),

    eventFromPublisherDeadExchange: `${eventFromPublisherId}.dead`,
    eventFromPublisherDeadQueue: `${eventFromPublisherId}.dead`,
    eventToPublisherDeadExchange: `${eventToPublisherId}.dead`,
    eventToPublisherDeadQueue: `${eventToPublisherId}.dead`
  }
}
