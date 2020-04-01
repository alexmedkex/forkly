import { Message } from 'amqplib'

const logger = {
  info: jest.fn(),
  error: jest.fn()
}

jest.mock('@komgo/logging', () => ({
  getLogger: () => {
    {
      return logger
    }
  },
  configureLogging: jest.fn()
}))

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
import { MailSender } from '../utils/mailSender'

import { inboundEmailRouter, INBOUND_EMAIL_ROUTER_INFO_MESSAGES } from './inbound-email-router'
import { ErrorCode } from '@komgo/error-utilities'
jest.mock('../utils/mailSender')

describe('InboundEmailRouter', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('rejects null message', async () => {
    const connection = connectionMock(null)
    await inboundEmailRouter(connection)
    await connection._playMock()

    expect(logger.error).toBeCalledWith(ErrorCode.UnexpectedError, INBOUND_EMAIL_ROUTER_INFO_MESSAGES.NULL_MESSAGE)
  })

  it('logs error if invalid json msg', async () => {
    const msg = {
      content: 'some content',
      properties: {
        headers: {}
      }
    }

    const connection = connectionMock(msg)

    await inboundEmailRouter(connection)

    await connection._playMock()
    expect(logger.error.mock.calls[0][0]).toBe('EUXP00')

    await connection._playMock()
    expect(logger.error.mock.calls[1][0]).toBe('EUXP00')
    expect(reject).toBeCalled()
  })

  it('forward email correctly', async () => {
    const msgContent = {
      taskType: 'taskType',
      link: 'http',
      recipients: ['rec1@komgo.io']
    }
    const msg = {
      content: JSON.stringify(msgContent),
      properties: {
        headers: {}
      }
    }

    const connection = connectionMock(msg)
    await inboundEmailRouter(connection)
    await connection._playMock()

    // @ts-ignore
    const mockMailSender = MailSender.mock.instances[0]

    expect(logger.info).toBeCalledWith(`Email sent...`)
    expect(ack).toBeCalledWith(msg)
    expect(mockMailSender.send).toBeCalledWith(msgContent)
  })
})
