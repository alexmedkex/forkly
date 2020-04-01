import { logger, Rabbit } from '../../utils'
import { Config } from '../../config'
import { MonitoringConfiguration } from '../../commands/command-platform'

export const onboardPlatformMonitoring = async (config: Config, opts: MonitoringConfiguration) => {
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
  await Promise.all([rabbit.assertUser(opts.user.name, opts.user.password, { tags: opts.user.tag })])

  const monitoringExchangeName = opts.exchangeName
  const deadExchangeName = `${opts.exchangeName}-DEAD`

  // COMMON: Exchanges:
  logger.info('Setting up exchanges...')
  await Promise.all([
    rabbit.assertExchange(monitoringExchangeName, 'direct', {
      durable: true
    }),
    rabbit.assertExchange(deadExchangeName, 'fanout', {
      durable: true
    }),
    rabbit.assertExchange(`${opts.exchangeName}-UNROUTED`, 'fanout', {
      durable: true
    })
  ])

  // COMMON: Queues:
  logger.info('Setting up queues...')
  await Promise.all([
    rabbit.assertQueue(opts.queueName, { durable: true }),
    rabbit.assertQueue(`${opts.queueName}-DEAD`, { durable: true }),
    rabbit.assertQueue(`${opts.queueName}-UNROUTED`, { durable: true })
  ])

  // COMMON: Bindings:
  logger.info('Setting up bingings...')
  await Promise.all([
    rabbit.assertBinding(monitoringExchangeName, opts.queueName, {
      routing_key: opts.routingKey
    }),
    rabbit.assertBinding(deadExchangeName, `${opts.queueName}-DEAD`),
    rabbit.assertBinding(`${opts.exchangeName}-UNROUTED`, `${opts.queueName}-UNROUTED`)
  ])

  // COMMON: Permissions:
  logger.info('Setting up permissions...')
  await Promise.all([
    rabbit.assertPermission(opts.user.name, {
      read: '^MONITORING-QUEUE'
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
    rabbit.assertPolicy(`DLX-${opts.queueName}`, {
      pattern: `^${opts.queueName}$`,
      definition: {
        [dlxKey]: deadExchangeName
      }
    })
  ])
}
