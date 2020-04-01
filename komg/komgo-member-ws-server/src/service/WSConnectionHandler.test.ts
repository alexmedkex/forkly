jest.mock('@komgo/error-utilities')
jest.mock('../utils/ErrorName')
jest.mock('../utils/verifyAuthorization')
jest.mock('../utils/getUserId')
jest.mock('@komgo/logging', () => ({
  getLogger: jest.fn(() => ({
    warn: jest.fn(),
    info: jest.fn()
  }))
}))
const join = jest.fn()
const emit = jest.fn()
const disconnect = jest.fn()
const on = jest.fn((a, callback) => {
  callback({ token: 'token' })
})
const socket = { on, join, emit, disconnect }

import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'

import { IWSConnectionHandler } from './WSConnectionHandler'

const wsConnectionHandler = iocContainer.get<IWSConnectionHandler>(TYPES.WSConnectionHandler)

describe('wsConnectionHandler', () => {
  it('should call join and emit on success', async () => {
    expect.assertions(2)
    await wsConnectionHandler.onWSConnected(socket)
    expect(join).toHaveBeenCalled()
    expect(emit).toHaveBeenCalled()
  })
  it('should log and disconnect on error', async () => {
    join.mockImplementation(() => {
      throw {
        response: { status: 'status' },
        config: { headers: { 'X-Request-ID': 'X-Request-ID' } }
      }
    })
    await wsConnectionHandler.onWSConnected(socket)
    expect(disconnect).toHaveBeenCalled()
  })
  it('should disconnect on timeout', async () => {
    join.mockImplementation(() => jest.fn())
    jest.useFakeTimers()
    on.mockImplementation((a, callback) => {
      setTimeout(() => {
        callback({ token: 'token' })
      }, 6000)
    })
    await wsConnectionHandler.onWSConnected(socket)
    jest.runAllTimers()
    expect(disconnect).toHaveBeenCalled()
  })
})
