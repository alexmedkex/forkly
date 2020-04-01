const amqpConnectMock = jest.fn()
jest.mock('amqp-connection-manager', () => ({
  connect: amqpConnectMock
}))

import { connect } from './connect'

describe('connect', () => {
  it('calls amqp.connect with COMMON_BROKER_AMQP_URI env var', () => {
    const uri = ['test-amqp-uri']
    process.env.COMMON_BROKER_AMQP_URI = uri as any

    connect()

    expect(amqpConnectMock).toHaveBeenCalledWith(uri)
  })
  it('calls amqp.connect and returns its result', () => {
    const expectedResult = {}
    amqpConnectMock.mockImplementationOnce(() => expectedResult)

    expect(connect()).toEqual(expectedResult)
  })
})
