import { ErrorCode } from '@komgo/error-utilities'

const logger = {
  metric: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
}

const sendMailMock = jest.fn(() => {
  return true
})
const createTransportMock = jest.fn(() => {
  return {
    sendMail: sendMailMock
  }
})
const createTestAccountMock = jest.fn(() => {
  return { user: 'user', password: 'password' }
})
const getTestMessageUrlMock = jest.fn()
jest.mock('nodemailer', () => ({
  createTransport: createTransportMock,
  createTestAccount: createTestAccountMock,
  getTestMessageUrl: getTestMessageUrlMock
}))

jest.mock('@komgo/logging', () => ({ getLogger: jest.fn(() => logger), configureLogging: jest.fn() }))
jest.setTimeout(160000) // find a way to fix this too

import { AmqpConnectionManager } from 'amqp-connection-manager'
import { Channel, Message } from 'amqplib'

import { connect } from '../src/connect'
import { start } from '../src/start'
import { ErrorName, ErrorMessage } from '../src/utils/error'

import { sleep, startContainers, stopContainers } from './utils'

let server: AmqpConnectionManager
let channel: Channel

// VAKT exchange (both inbound and dead) info:
const VAKT_INBOUND_EX = 'VAKT-INBOUND-EXCHANGE'
const VAKT_DEAD_EX = 'VAKT-INBOUND-EXCHANGE-DEAD'
const VAKT_INBOUND_QUEUE = 'VAKT-INBOUND-QUEUE'
const VAKT_DEAD_QUEUE = 'VAKT-INBOUND-QUEUE-DEAD'

// MONITORING exchange (both inbound and dead) info:
const MONITORING_INBOUND_EX = 'MONITORING-EXCHANGE'
const MONITORING_DEAD_EX = 'MONITORING-EXCHANGE-DEAD'
const MONITORING_INBOUND_QUEUE = 'EMAIL-NOTIFICATION-QUEUE'
const MONITORING_DEAD_QUEUE = 'EMAIL-NOTIFICATION-QUEUE-DEAD'

// Recipient exchange:
const RECIPIENT_MNID = 'RECIPIENT'
const RECIPIENT_EX = `${RECIPIENT_MNID}-EXCHANGE`
const RECIPIENT_QUEUE = `${RECIPIENT_MNID}-QUEUE`

// Main:
describe('Inbound Router', () => {
  beforeAll(async done => {
    await startContainers()
    const connection = await connect()
    connection.createChannel({
      setup: async (rawChannel: Channel) => {
        // Prepare test channel and VAKT exchanges and queues:
        channel = rawChannel

        // Building VAKT queues and exchanges:
        await channel.assertExchange(VAKT_INBOUND_EX, 'fanout')
        await channel.assertExchange(VAKT_DEAD_EX, 'fanout')
        await channel.assertQueue(VAKT_INBOUND_QUEUE, { arguments: { 'x-dead-letter-exchange': VAKT_DEAD_EX } })
        await channel.assertQueue(VAKT_DEAD_QUEUE)

        // Building VAKT bindings and DLX:
        await channel.bindQueue(VAKT_INBOUND_QUEUE, VAKT_INBOUND_EX, '')
        await channel.bindQueue(VAKT_DEAD_QUEUE, VAKT_DEAD_EX, '')

        // Building recipient queue and exchange:
        await channel.assertExchange(RECIPIENT_EX, 'fanout')
        await channel.assertQueue(RECIPIENT_QUEUE)

        // Building recipient binding (without DLX):
        await channel.bindQueue(RECIPIENT_QUEUE, RECIPIENT_EX, '')

        // Building MONITORING queues and exchanges:
        await channel.assertExchange(MONITORING_INBOUND_EX, 'fanout')
        await channel.assertExchange(MONITORING_DEAD_EX, 'fanout')
        await channel.assertQueue(MONITORING_INBOUND_QUEUE, {
          arguments: { 'x-dead-letter-exchange': MONITORING_DEAD_EX }
        })
        await channel.assertQueue(MONITORING_DEAD_QUEUE)

        // Building MONITORING bindings and DLX:
        await channel.bindQueue(MONITORING_INBOUND_QUEUE, MONITORING_INBOUND_EX, 'komgo.email-notification')
        await channel.bindQueue(MONITORING_DEAD_QUEUE, MONITORING_DEAD_EX, '')

        // Building recipient queue and exchange:
        await channel.assertExchange(RECIPIENT_EX, 'fanout')
        await channel.assertQueue(RECIPIENT_QUEUE)

        // Building recipient binding (without DLX):
        await channel.bindQueue(RECIPIENT_QUEUE, RECIPIENT_EX, '')

        // Run server and start tests:
        server = await start()
        await sleep(500)
        done()
      }
    })
  })

  beforeEach(async () => {
    await clean(VAKT_INBOUND_QUEUE)
    await clean(VAKT_DEAD_QUEUE)
    await clean(MONITORING_INBOUND_QUEUE)
    await clean(MONITORING_DEAD_QUEUE)
    jest.resetAllMocks()
  })

  it('fails to route message without proper headers', async () => {
    const content = 'hello world'
    const headers = {}
    await publish(VAKT_INBOUND_EX, content, { headers })

    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidHeaders,
      ErrorMessage.InvalidHeaders,
      expect.any(Object)
    )
    expect(await message(VAKT_INBOUND_QUEUE)).toBeFalsy()
    expect(await message(VAKT_DEAD_QUEUE)).toBeTruthy()
  })

  it('fails to route message with invalid recipient', async () => {
    const content = 'hello world'
    const headers = { 'sender-mnid': 'SOME_SENDER', 'recipient-mnid': 'INVALID_RECIPIENT' }
    await publish(VAKT_INBOUND_EX, content, { headers })

    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidExchange,
      ErrorMessage.InvalidExchange,
      expect.any(Object)
    )
    expect(await message(VAKT_INBOUND_QUEUE)).toBeFalsy()
    expect(await message(VAKT_DEAD_QUEUE)).toBeTruthy()
  })

  it('routes proper message', async () => {
    const content = 'hello world'
    const headers = { 'sender-mnid': 'SOME_SENDER', 'recipient-mnid': RECIPIENT_MNID }
    const messageId = 'some-message-id'

    await publish(VAKT_INBOUND_EX, content, { headers, messageId })

    expect(await message(VAKT_INBOUND_QUEUE)).toBeFalsy()
    expect(await message(VAKT_DEAD_QUEUE)).toBeFalsy()

    const recieved = (await message(RECIPIENT_QUEUE)) as Message
    expect(recieved.fields.routingKey).toEqual('komgo.internal')
    expect(recieved.properties.headers).toMatchObject({ 'sender-platform': 'vakt' })
    expect(recieved.properties.headers).toMatchObject(headers)
    expect(recieved.properties.messageId).toMatch(messageId)
    expect(recieved.content.toString()).toEqual(content)
    expect(logger.info).toBeCalled()
  })

  it('routes proper email message', async () => {
    const content = {
      from: 'no-reply@komgo.io',
      body: `http://komgo.io`,
      subject: 'LC Rquested',
      recipients: ['a@komgo.io']
    }
    const headers = {}
    const messageId = 'some-message-id'
    process.env.MAIL_FROM = 'no-reply@komgo.io'

    await publish(MONITORING_INBOUND_EX, JSON.stringify(content), { headers, messageId }, 'komgo.email-notification')

    expect(await message(MONITORING_INBOUND_QUEUE)).toBeFalsy()
    expect(await message(MONITORING_DEAD_QUEUE)).toBeFalsy()

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@komgo.io',
      html: 'http://komgo.io',
      subject: '[KOMGO] [LC Rquested]',
      to: ['a@komgo.io']
    })
  })

  it('successfully recovers after message with invalid recipient exchange', async () => {
    const firstContent = 'first valid message'
    const headers = { 'sender-mnid': 'SOME_SENDER', 'recipient-mnid': RECIPIENT_MNID }
    await publish(VAKT_INBOUND_EX, firstContent, { headers })

    expect(await message(VAKT_INBOUND_QUEUE)).toBeFalsy()
    expect(await message(VAKT_DEAD_QUEUE)).toBeFalsy()

    await publish(VAKT_INBOUND_EX, 'invalid message', {
      headers: {
        'sender-mnid': 'SOME_SENDER',
        'recipient-mnid': 'INVALID_RECIPIENT'
      }
    })

    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidExchange,
      ErrorMessage.InvalidExchange,
      expect.any(Object)
    )

    expect(await message(VAKT_INBOUND_QUEUE)).toBeFalsy()
    expect(await message(VAKT_DEAD_QUEUE)).toBeTruthy()

    const secondContent = 'second valid message'
    await publish(VAKT_INBOUND_EX, secondContent, { headers })

    const firstMessage = (await message(RECIPIENT_QUEUE)) as Message // pop first message
    const secondMessage = (await message(RECIPIENT_QUEUE)) as Message // pop second message

    expect(firstMessage.content.toString()).toEqual(firstContent)
    expect(secondMessage.content.toString()).toEqual(secondContent)
  })

  afterAll(async () => {
    await channel.close()
    await server.close()
    await stopContainers()
  })
})

// Helpers:
const publish = async (exchange: string, content: string, args?: object, routingKey: string = '') => {
  channel.publish(exchange, routingKey, Buffer.from(content), args)
  await sleep(100) // find a way to remove this somehow, events probably?
}

const message = async (queue: string) => {
  return channel.get(queue)
}

const clean = async (queue: string) => {
  while (true) {
    const msg = await channel.get(queue)
    if (!msg) break
  }
}
