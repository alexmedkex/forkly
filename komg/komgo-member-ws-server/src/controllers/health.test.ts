const checkService = jest.fn(() => ({ connected: true }))
const checkRabbitMQ = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkService,
    checkRabbitMQ
  }
}))

const env = { ...process.env }
delete process.env.NODE_ENV

import { healthz, ready } from './health'

const req = {
  body: {},
  get: jest.fn()
} as any
const send = jest.fn()
const res = {
  sendCalledWith: '',
  status: jest.fn(() => ({ send })),
  send: jest.fn()
} as any

describe('HealthController', () => {
  beforeEach(() => {
    checkService.mockClear()
    checkRabbitMQ.mockClear()
  })
  afterEach(() => {
    process.env = env
  })
  it('should return all connections with status OK', async () => {
    await healthz(req, res)
    expect(send).toHaveBeenCalled()
  })

  it('should return all connections with status OK', async () => {
    await ready(req, res)
    expect(send).toHaveBeenCalledWith({ apiAuth: 'OK', rabbitMQ: 'OK' })
  })
  it('should return rabbitMQ status with error', async () => {
    checkRabbitMQ.mockImplementation(() => ({ connected: false, error: 'error' }))
    await ready(req, res)
    expect(send).toHaveBeenCalledWith({
      apiAuth: 'OK',
      rabbitMQ: 'error'
    })
  })
  it('should return apiAuth status with error', async () => {
    checkRabbitMQ.mockImplementation(() => ({ connected: true }))
    checkService.mockImplementation(() => ({ connected: false, error: 'error' }))
    await ready(req, res)
    expect(send).toHaveBeenCalledWith({
      apiAuth: 'error',
      rabbitMQ: 'OK'
    })
  })
})
