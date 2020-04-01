const error = jest.fn()
jest.mock('@komgo/logging', () => ({
  getLogger: jest.fn(() => ({
    warn: jest.fn(),
    error,
    info: jest.fn()
  }))
}))

const listen = jest.fn((a, callback) => callback())
const mockServer = { listen }
const on = jest.fn((a, callback) => {
  callback()
})
const mockSocketIO = { on }
const mockWSConnectionHandler = {
  onWSConnected: jest.fn()
}
const createListener = jest.fn()
const mockMQMessageHandler = {
  createListener
}

const env = { ...process.env }
delete process.env.PORT

import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'

import { Server } from './Server'

iocContainer.rebind(TYPES.HttpServer).toConstantValue(mockServer)
iocContainer.rebind(TYPES.SocketIO).toConstantValue(mockSocketIO)
iocContainer.rebind(TYPES.WSConnectionHandler).toConstantValue(mockWSConnectionHandler)
iocContainer.rebind(TYPES.MQMessageHandler).toConstantValue(mockMQMessageHandler)
const server = iocContainer.get<Server>(TYPES.Server)

describe('server', () => {
  afterEach(() => {
    process.env = env
  })
  it('should call listen on success', () => {
    server.connect()
    expect(listen).toHaveBeenCalled()
    expect(on).toHaveBeenCalled()
  })
  it('should log an error on failed connection', () => {
    createListener.mockImplementation(() => {
      throw new Error()
    })
    server.connect()
    expect(error).toHaveBeenCalled()
  })
})
