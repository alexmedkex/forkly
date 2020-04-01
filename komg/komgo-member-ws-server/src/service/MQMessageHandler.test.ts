const ack = jest.fn()
const reject = jest.fn()
const message = {
  routingKey: 'a.b.c',
  content: { recipient: 'recipient', type: 'type', payload: 'payload' },
  ack,
  reject,
  options: { messageId: 'messageId', requestId: 'requestId' }
}
const listen = jest.fn((a, b, callback) => callback(message))
const mockConsumer = { listen }
const emit = jest.fn()
const mockSocketIO = { to: jest.fn(() => ({ emit })) }

import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'

import { IMQMessageHandler } from './MQMessageHandler'

iocContainer.rebind(TYPES.ConsumerWatchdog).toConstantValue(mockConsumer)
iocContainer.rebind(TYPES.SocketIO).toConstantValue(mockSocketIO)
const mqMessageHandler = iocContainer.get<IMQMessageHandler>(TYPES.MQMessageHandler)

describe('mqMessageHandler', () => {
  it('should call ack and emit on success', async () => {
    expect.assertions(2)
    await mqMessageHandler.createListener()
    expect(ack).toHaveBeenCalled()
    expect(emit).toHaveBeenCalled()
  })
  it('should call reject on error', async () => {
    listen.mockImplementation((a, b, callback) => callback({ ...message, content: 'invalid' }))
    await mqMessageHandler.createListener()
    expect(reject).toHaveBeenCalled()
  })
  it('should call reject on invalid payload', async () => {
    listen.mockImplementation((a, b, callback) => callback({ ...message, content: { recipient: 'recipient' } }))
    await mqMessageHandler.createListener()
    expect(reject).toHaveBeenCalled()
  })
  it('should call reject on invalid routingKey', async () => {
    listen.mockImplementation((a, b, callback) => callback({ ...message, routingKey: 'invalid' }))
    await mqMessageHandler.createListener()
    expect(reject).toHaveBeenCalled()
  })
})
