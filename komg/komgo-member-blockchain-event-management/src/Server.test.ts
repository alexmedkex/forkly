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

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'

import { Server } from './Server'

iocContainer.rebind(TYPES.HttpServer).toConstantValue(mockServer)
const server = iocContainer.get<Server>(TYPES.Server)

describe('server', () => {
  it('should call listen on success', () => {
    server.connect()
    expect(listen).toHaveBeenCalled()
  })
})
