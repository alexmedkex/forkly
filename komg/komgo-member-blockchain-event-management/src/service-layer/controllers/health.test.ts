import { ready } from './health'

const req = {
  body: {},
  get: jest.fn()
}
const send = jest.fn()

const res = {
  sendCalledWith: '',
  status: jest.fn(() => ({ send })),
  send: jest.fn()
}

import { iocContainer } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

describe('HealthController', () => {
  it('should return all connections with status OK', async () => {
    const mockIsReadyChecker = {
      status: jest.fn(() => ({ isReady: true, details: { apiAuth: 'OK', rabbitMQ: 'OK' } }))
    }
    iocContainer.rebind(TYPES.IsReadyChecker).toConstantValue(mockIsReadyChecker)

    await ready(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(send).toHaveBeenCalledWith({ apiAuth: 'OK', rabbitMQ: 'OK' })
  })

  it('should return rabbitMQ status with error', async () => {
    const mockIsReadyChecker = {
      status: jest.fn(() => ({ isReady: false, details: { apiAuth: 'OK', rabbitMQ: 'error' } }))
    }
    iocContainer.rebind(TYPES.IsReadyChecker).toConstantValue(mockIsReadyChecker)

    await ready(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(send).toHaveBeenCalledWith({
      apiAuth: 'OK',
      rabbitMQ: 'error'
    })
  })
})
