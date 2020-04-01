import { logger, Rabbit } from '../../utils'
import { Config } from '../../config'
import { generatePw } from '../onboard-member/generate-credentials'

export const onboardPlatformEmailNotification = async (config: Config) => {
  // COMMON: Constants:
  const rabbit = new Rabbit({
    schema: config.get('common.schema'),
    hostport: config.get('common.port'),
    hostname: config.get('common.hostname'),
    username: config.get('common.username'),
    password: config.get('common.password')
  })

  // COMMON: Users:
  logger.info('Setting up users....')
  await Promise.all([rabbit.assertUser('EMAIL-NOTIFICATION-USER', generatePw(12), { tags: 'management' })])

  const monitoringExchangeName = 'MONITORING-EXCHANGE'
  const emailNotificationQueueName = 'EMAIL-NOTIFICATION-QUEUE'
  const emailNotificationRK = 'komgo.email-notification'
  const deadExchangeName = `MONITORING-EXCHANGE-DEAD`

  // COMMON: Exchanges:
  logger.info('Setting up exchanges...')
  await Promise.all([
    rabbit.assertExchange(monitoringExchangeName, 'direct', {
      durable: true
    }),
    rabbit.assertExchange(deadExchangeName, 'fanout', {
      durable: true
    }),
    rabbit.assertExchange(`${monitoringExchangeName}-UNROUTED`, 'fanout', {
      durable: true
    })
  ])

  // COMMON: Queues:
  logger.info('Setting up queues...')
  await Promise.all([
    rabbit.assertQueue(emailNotificationQueueName, { durable: true }),
    rabbit.assertQueue(`${emailNotificationQueueName}-DEAD`, { durable: true }),
    rabbit.assertQueue(`${emailNotificationQueueName}-UNROUTED`, { durable: true })
  ])

  // COMMON: Bindings:
  logger.info('Setting up bingings...')
  await Promise.all([
    rabbit.assertBinding(monitoringExchangeName, emailNotificationQueueName, {
      routing_key: emailNotificationRK
    }),
    rabbit.assertBinding(deadExchangeName, `${emailNotificationQueueName}-DEAD`),
    rabbit.assertBinding(`${monitoringExchangeName}-UNROUTED`, `${emailNotificationQueueName}-UNROUTED`)
  ])

  // COMMON: Permissions:
  logger.info('Setting up permissions...')
  await Promise.all([
    rabbit.assertPermission('EMAIL-NOTIFICATION-USER', {
      read: '^EMAIL-NOTIFICATION-QUEUE'
    })
  ])

  // COMMON: Policies:
  const dlxKey = 'dead-letter-exchange'
  const altKey = 'alternate-exchange'
  logger.info('Setting up policies...')
  await Promise.all([
    rabbit.assertPolicy(`DLX-${monitoringExchangeName}`, {
      pattern: `^${monitoringExchangeName}$`,
      'apply-to': 'exchanges',
      definition: {
        [dlxKey]: deadExchangeName,
        [altKey]: `${monitoringExchangeName}-UNROUTED`
      }
    }),
    rabbit.assertPolicy(`DLX-${emailNotificationQueueName}`, {
      pattern: `^${emailNotificationQueueName}$`,
      definition: {
        [dlxKey]: deadExchangeName
      }
    })
  ])
}
