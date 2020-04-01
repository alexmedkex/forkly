import { logger, Rabbit } from '../../utils'
import { Config } from '../../config'
import { CredentialsContainer } from './generate-credentials'

export const onboardMemberBroker = async (
  config: Config,
  container: CredentialsContainer,
  skipUserCreation: boolean = false
) => {
  // Splitting data:
  const { mnid, credentials } = container
  const rabbit = new Rabbit({
    schema: config.get('common.schema'),
    hostport: config.get('common.port'),
    hostname: config.get('common.hostname'),
    username: config.get('common.username'),
    password: config.get('common.password')
  })

  // COMMON: Users:
  if (skipUserCreation) {
    logger.info('Setting up RMQ users....           (skipped)')
  } else {
    logger.info('Setting up RMQ users....')
    await rabbit.assertUser(credentials.rabbitMQCommonUser, credentials.rabbitMQCommonPassword, { tags: 'management' })
  }

  // COMMON: Exchanges:
  logger.info('Setting up RMQ exchanges...')
  await rabbit.assertExchange(`${mnid}-EXCHANGE-ALT`, 'direct', { durable: true })
  await rabbit.assertExchange(`${mnid}-EXCHANGE`, 'direct', { durable: true })
  await rabbit.assertExchange(`${mnid}-EXCHANGE-ACK`, 'direct', { durable: true })

  await rabbit.assertPolicy(`${mnid}-EXCHANGE-ALT`, {
    pattern: `^${mnid}-EXCHANGE(-ACK)?$`,
    'apply-to': 'exchanges',
    definition: {
      'alternate-exchange': `${mnid}-EXCHANGE-ALT`
    }
  })

  // COMMON: Queues:
  logger.info('Setting up RMQ queues...')
  await rabbit.assertQueue(`${mnid}-QUEUE-ALT`, { durable: true })
  await rabbit.assertQueue(`${mnid}-QUEUE`, {
    durable: true,
    arguments: { 'x-dead-letter-exchange': `${mnid}-EXCHANGE-ACK` }
  })
  await rabbit.assertQueue(`${mnid}-QUEUE-ACK`, { durable: true })

  // COMMON: Bindings:
  logger.info('Setting up RMQ bindings...')
  await rabbit.assertBinding(`${mnid}-EXCHANGE-ALT`, `${mnid}-QUEUE-ALT`, { routing_key: '#' })
  await rabbit.assertBinding(`${mnid}-EXCHANGE`, `${mnid}-QUEUE`, { routing_key: 'komgo.internal' })
  await rabbit.assertBinding(`${mnid}-EXCHANGE-ACK`, `${mnid}-QUEUE-ACK`, { routing_key: 'komgo.internal' })

  // COMMON: Permissions:
  if (skipUserCreation) {
    logger.info('Setting up RMQ permissions...      (skipped)')
  } else {
    logger.info('Setting up RMQ permissions...')
    await rabbit.assertPermission(`${mnid}-USER`, {
      read: `^${mnid}-QUEUE(-ACK|-ALT)?`,
      write: `(.*(?<!INBOUND)-EXCHANGE)(?!-)|${mnid}-EXCHANGE-ACK`
    })
  }
}
