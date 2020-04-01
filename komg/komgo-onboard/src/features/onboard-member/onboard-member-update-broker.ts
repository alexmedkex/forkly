import { logger, Rabbit } from '../../utils'
import { Config } from '../../config'
import { CredentialsContainer } from './generate-credentials'

/**
 * Configures alternate exchange for each member exchange of the common broker
 * so that messages with invalid routing keys won't get lost
 */
export const onboardMemberUpdateBroker = async (config: Config, mnid: string) => {
  const rabbit = new Rabbit({
    schema: config.get('common.schema'),
    hostport: config.get('common.port'),
    hostname: config.get('common.hostname'),
    username: config.get('common.username'),
    password: config.get('common.password')
  })

  // COMMON: Exchanges:
  logger.info('Setting up  ALT RMQ exchange...')
  await rabbit.assertExchange(`${mnid}-EXCHANGE-ALT`, 'direct', { durable: true })

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

  // COMMON: Bindings:
  logger.info('Setting up RMQ bindings...')
  await rabbit.assertBinding(`${mnid}-EXCHANGE-ALT`, `${mnid}-QUEUE-ALT`, { routing_key: '#' })

  // COMMON: Permissions:
  logger.info('Setting up RMQ permissions...')
  await rabbit.assertPermission(`${mnid}-USER`, {
    read: `^${mnid}-QUEUE(-ACK|-ALT)?`,
    write: `(.*(?<!INBOUND)-EXCHANGE)(?!-)|${mnid}-EXCHANGE-ACK`
  })
}
