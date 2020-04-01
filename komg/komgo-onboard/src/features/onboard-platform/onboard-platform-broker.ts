import { logger, Rabbit } from '../../utils'
import { Config } from '../../config'
import { PlatformOptions } from '../../commands/command-platform'

export const onboardPlatformBroker = async (config: Config, opts: PlatformOptions) => {
  // COMMON: Constants:
  const rabbit = new Rabbit({
    schema: config.get('common.schema'),
    hostport: config.get('common.port'),
    hostname: config.get('common.hostname'),
    username: config.get('common.username'),
    password: config.get('common.password')
  })

  // COMMON: Users:
  const name = opts.name
  logger.info('Setting up users....')
  await Promise.all([
    rabbit.assertUser(config.get('routing.username'), config.get('routing.password'), { tags: 'administrator' }),
    rabbit.assertUser(opts.guestUser.username, opts.guestUser.password, { tags: opts.guestUser.permission.tag })
  ])

  const inboundExchangeName = `${name}-INBOUND-EXCHANGE`
  const deadExchangeName = `${name}-INBOUND-EXCHANGE-DEAD`

  // COMMON: Exchanges:
  logger.info('Setting up exchanges...')
  await Promise.all([
    rabbit.assertExchange(inboundExchangeName, 'direct', {
      durable: true
    }),
    rabbit.assertExchange(deadExchangeName, 'fanout', {
      durable: true
    }),
    rabbit.assertExchange(`${name}-INBOUND-EXCHANGE-UNROUTED`, 'fanout', {
      durable: true
    }),
    rabbit.assertExchange(`${name}-OUTBOUND-EXCHANGE`, 'direct', {
      durable: true
    }),
    rabbit.assertExchange(`${name}-OUTBOUND-EXCHANGE-DEAD`, 'fanout', {
      durable: true
    }),
    rabbit.assertExchange(`${name}-OUTBOUND-EXCHANGE-UNROUTED`, 'fanout', {
      durable: true
    })
  ])

  // COMMON: Queues:
  logger.info('Setting up queues...')
  await Promise.all([
    rabbit.assertQueue(`${name}-INBOUND-QUEUE`, { durable: true }),
    rabbit.assertQueue(`${name}-INBOUND-QUEUE-DEAD`, { durable: true }),
    rabbit.assertQueue(`${name}-INBOUND-QUEUE-UNROUTED`, { durable: true }),
    rabbit.assertQueue(`${name}-OUTBOUND-QUEUE`, { durable: true }),
    rabbit.assertQueue(`${name}-OUTBOUND-QUEUE-DEAD`, { durable: true }),
    rabbit.assertQueue(`${name}-OUTBOUND-QUEUE-UNROUTED`, { durable: true })
  ])

  // COMMON: Bindings:
  logger.info('Setting up bingings...')
  await Promise.all([
    rabbit.assertBinding(inboundExchangeName, `${name}-INBOUND-QUEUE`, {
      routing_key: 'external.members.message'
    }),
    rabbit.assertBinding(deadExchangeName, `${name}-INBOUND-QUEUE-DEAD`),
    rabbit.assertBinding(`${name}-INBOUND-EXCHANGE-UNROUTED`, `${name}-INBOUND-QUEUE-UNROUTED`),
    rabbit.assertBinding(`${name}-OUTBOUND-EXCHANGE`, `${name}-OUTBOUND-QUEUE`, { routing_key: 'komgo.internal' }),
    rabbit.assertBinding(`${name}-OUTBOUND-EXCHANGE-DEAD`, `${name}-OUTBOUND-QUEUE-DEAD`),
    rabbit.assertBinding(`${name}-OUTBOUND-EXCHANGE-UNROUTED`, `${name}-OUTBOUND-QUEUE-UNROUTED`)
  ])

  // COMMON: Permissions:
  logger.info('Setting up permissions...')
  await Promise.all([
    rabbit.assertPermission(config.get('routing.username'), {
      write: opts.guestUser.permission.write,
      read: opts.guestUser.permission.read
    }),
    rabbit.assertPermission(`${name}-USER`, { write: '^VAKT-INBOUND-EXCHANGE' })
  ])

  // COMMON: Policies:
  const dlxKey = 'dead-letter-exchange'
  const altKey = 'alternate-exchange'
  logger.info('Setting up policies...')
  await Promise.all([
    rabbit.assertPolicy(`DLX-${name}-INBOUND-EXCHANGE`, {
      pattern: `^${name}-INBOUND-EXCHANGE$`,
      'apply-to': 'exchanges',
      definition: {
        [dlxKey]: deadExchangeName,
        [altKey]: `${name}-INBOUND-EXCHANGE-UNROUTED`
      }
    }),
    rabbit.assertPolicy(`DLX-${name}-OUTBOUND-EXCHANGE`, {
      pattern: `^${name}-OUTBOUND-EXCHANGE$`,
      'apply-to': 'exchanges',
      definition: {
        [dlxKey]: `${name}-OUTBOUND-EXCHANGE-DEAD`,
        [altKey]: `${name}-OUTBOUND-EXCHANGE-UNROUTED`
      }
    }),
    rabbit.assertPolicy(`DLX-${name}-INBOUND-QUEUE`, {
      pattern: `^${name}-INBOUND-QUEUE$`,
      definition: {
        [dlxKey]: deadExchangeName
      }
    }),
    rabbit.assertPolicy(`DLX-${name}-OUTBOUND-QUEUE`, {
      pattern: `^${name}-OUTBOUND-QUEUE$`,
      definition: {
        [dlxKey]: `${name}-OUTBOUND-EXCHANGE-DEAD`
      }
    })
  ])

  // COMMON: Shovels:
  logger.info('Setting up shovels...')
  await Promise.all(
    opts.shovels.map(async (shovel, index) => {
      const shovelName = `${name}-shovel-${index + 1}`
      let destUri = `${shovel.dest.protocol}://${shovel.dest.username}:${shovel.dest.password}@${shovel.dest.host}:${
        shovel.dest.port
      }`
      if (shovel.sslOptions) {
        logger.info('Setting up shovel #' + (index + 1) + ' with SSL...')
        const args = []
        if (shovel.sslOptions.cacertfile) args.push(`cacertfile=${shovel.sslOptions.cacertfile}`)
        if (shovel.sslOptions.verify) args.push(`verify=${shovel.sslOptions.verify}`)
        if (shovel.sslOptions.depth) args.push(`depth=${shovel.sslOptions.depth}`)
        if (shovel.sslOptions.serverNameIndication) {
          args.push(`server_name_indication=${shovel.sslOptions.serverNameIndication}`)
        }
        destUri = destUri + '?' + args.join('&')
      } else {
        logger.info('Setting up shovel #' + (index + 1) + '...')
      }
      await rabbit.assertShovel(shovelName, {
        'src-protocol': 'amqp091',
        'src-uri': `${shovel.src.protocol}://${config.get('common.username')}:${config.get('common.password')}@${
          shovel.src.host
        }:${shovel.src.port}`,
        'src-queue': `${shovel.src.queue}`,
        'dest-protocol': 'amqp091',
        'dest-uri': destUri,
        'dest-exchange': shovel.dest.exchange,
        'dest-exchange-key': shovel.dest.key
      })
    })
  )
  /*
  const shovelName = name.toUpperCase()[0] + name.slice(1).toLowerCase()
  await rabbit.assertShovel(`KomComTo${shovelName}Shovel`, {
    'src-protocol': 'amqp091',
    'src-uri': `amqps://${config.get('common.username')}:${config.get('common.password')}@komgo-common-mq-node-1`,
    'src-queue': `${name}-OUTBOUND-QUEUE`,
    'dest-protocol': 'amqp091',
    'dest-uri': 'amqps://VaktGuestAccount:Tostoresomewhere@komgo-vakt-mq-node-1',
    'dest-exchange': 'KOMGO-INBOUND-EXCHANGE',
    'dest-exchange-key': 'external.members.message'
  })*/
}
