import { ErrorCode } from '@komgo/error-utilities'
import { Message } from 'amqplib'

import { ErrorName, ErrorMessage } from '../utils/error'

const logger = {
  metric: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}
const checkMNID = jest.fn()
const checkExchange = jest.fn()

jest.mock('../utils/check-mnid', () => ({ checkMNID }))
jest.mock('@komgo/logging', () => ({ getLogger: jest.fn(() => logger) }))

const reject = jest.fn()
const publish = jest.fn()
const ack = jest.fn()

const connectionMock = (msg: any): any => {
  const stack: Array<[any, any]> = []
  return {
    createChannel(opts: any) {
      opts.setup({
        consume(queueName: string, callback: (msg: Message) => Promise<void>) {
          stack.push([callback, msg])
        },
        checkExchange,
        reject,
        publish,
        ack
      })
    },
    async _playMock() {
      await Promise.all(
        stack.map(tuple => {
          const [cb, cmsg] = tuple
          return cb(cmsg)
        })
      )
    }
  }
}

import { inboundRouter } from './inbound-router'

describe('inboundRouter', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('rejects null message', async () => {
    const msg = null

    const connection = connectionMock(null)
    await inboundRouter('VAKT', connection)
    await connection._playMock()

    expect(reject).not.toBeCalledWith(msg) // nothing to reject
    expect(logger.warn).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.NullMessage,
      ErrorMessage.NullMessage
    )
    expect(publish).not.toBeCalled()
    expect(ack).not.toBeCalled()
  })

  it('rejects message without required headers', async () => {
    const msg = {
      properties: {
        messageId: 'someMessageId',
        headers: {}
      }
    }

    const connection = connectionMock(msg)
    checkExchange.mockResolvedValue(true)
    checkMNID.mockResolvedValue(true)

    const msgId = msg.properties.messageId
    await inboundRouter('VAKT', connection)
    await connection._playMock()

    expect(reject).toBeCalledWith(msg, false)
    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidHeaders,
      ErrorMessage.InvalidHeaders,
      {
        msgId
      }
    )
    expect(publish).not.toBeCalled()
    expect(ack).not.toBeCalled()
  })

  it('rejects message with bad MNID', async () => {
    const senderMNID = 'senderMNID'
    const recipientMNID = 'recipientMNID'
    const msg = {
      content: 'some content',
      properties: {
        headers: {
          'sender-mnid': senderMNID,
          'recipient-mnid': recipientMNID
        }
      }
    }

    const connection = connectionMock(msg)
    checkExchange.mockResolvedValue(false)
    checkMNID.mockResolvedValue(false)

    await inboundRouter('VAKT', connection)
    await connection._playMock()

    expect(reject).toBeCalledWith(msg, false)
    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidRecipient,
      ErrorMessage.InvalidRecipient,
      {
        recipientMNID,
        senderMNID
      }
    )

    expect(publish).not.toBeCalled()
    expect(ack).not.toBeCalled()
  })

  it('rejects message with non-existing exchange', async () => {
    const senderMNID = 'senderMNID'
    const recipientMNID = 'recipientMNID'
    const msg = {
      content: 'some content',
      properties: {
        headers: {
          'sender-mnid': senderMNID,
          'recipient-mnid': recipientMNID
        }
      }
    }

    const connection = connectionMock(msg)
    checkExchange.mockRejectedValue('Bork')
    checkMNID.mockResolvedValue(true)

    await inboundRouter('VAKT', connection)
    await connection._playMock()

    const logObject = { error: 'Bork', stacktrace: undefined }
    const recipientExchange = `${recipientMNID}-EXCHANGE`
    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidExchange,
      ErrorMessage.InvalidExchange,
      {
        ...logObject,

        recipientExchange,
        recipientMNID,
        senderMNID
      }
    )

    expect(reject).not.toBeCalled()
    // ^ because it will not call reject, flagging lastMessageWasFaulty as true

    expect(publish).not.toBeCalled()
    expect(ack).not.toBeCalled()
  })

  it('logs error if channel.publish throws an exception', async () => {
    const senderMNID = 'senderMNID'
    const recipientMNID = 'recipientMNID'
    const msg = {
      content: 'some content',
      properties: {
        messageId: 'message-id',
        headers: {
          'sender-mnid': senderMNID,
          'recipient-mnid': recipientMNID
        }
      }
    }

    const connection = connectionMock(msg)
    checkExchange.mockResolvedValue(true)
    checkMNID.mockResolvedValue(true)
    publish.mockImplementation(() => {
      throw new Error('up')
    })

    await inboundRouter('VAKT', connection)
    await connection._playMock()

    const recipientExchange = `${recipientMNID}-EXCHANGE`
    const routingKey = 'komgo.internal'
    const { content, properties } = msg

    properties.headers['sender-platform'] = 'vakt'
    expect(publish).toBeCalledWith(recipientExchange, routingKey, content, properties)
    // ^ caused an exception

    expect(reject).not.toBeCalled()
    expect(logger.error).toBeCalledWith(
      ErrorCode.ValidationExternalInboundAMQP,
      ErrorName.InvalidPublish,
      ErrorMessage.InvalidPublish,
      {
        error: 'up',
        recipientExchange: 'recipientMNID-EXCHANGE',
        recipientMNID: 'recipientMNID',
        senderMNID: 'senderMNID',
        stacktrace: expect.any(String)
      }
    )
  })

  it('routes proper message', async () => {
    const senderMNID = 'senderMNID'
    const recipientMNID = 'recipientMNID'
    const msg = {
      content: 'some content',
      properties: {
        messageId: 'message-id',
        headers: {
          'sender-mnid': senderMNID,
          'recipient-mnid': recipientMNID
        }
      }
    }

    const connection = connectionMock(msg)
    checkExchange.mockResolvedValue(true)
    checkMNID.mockResolvedValue(true)

    await inboundRouter('VAKT', connection)
    await connection._playMock()

    const recipientExchange = `${recipientMNID}-EXCHANGE`
    const routingKey = 'komgo.internal'
    const { content, properties } = msg

    properties.headers['sender-platform'] = 'vakt'
    expect(publish).toBeCalledWith(recipientExchange, routingKey, content, properties)
    expect(logger.info).toBeCalled()

    expect(logger.error).not.toBeCalled()
    expect(reject).not.toBeCalled()
  })
})
