import 'reflect-metadata'

const connected = {
  connected: true
}
const disconnected = {
  disconnected: true,
  error: 'string'
}
const checkerInstanceMock = {
  checkMongoDB: jest.fn(() => connected),
  checkRabbitMQ: jest.fn(() => connected),
  checkService: jest.fn(() => connected)
}

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: checkerInstanceMock
}))

import IIsReadyChecker from './IIsReadyChecker'
import IsReadyChecker from './IsReadyChecker'

describe('IsReadyChecker', () => {
  let isReadyChecker: IIsReadyChecker
  let mockCommonMessagingAgent

  beforeEach(() => {
    mockCommonMessagingAgent = {
      getVhosts: jest.fn(() => Promise.resolve([{}]))
    }
    isReadyChecker = new IsReadyChecker(mockCommonMessagingAgent)
  })

  it('Should return true if all services are connected', async () => {
    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(true)
  })

  it('Should return false if mongodb is disconnected', async () => {
    checkerInstanceMock.checkMongoDB.mockImplementationOnce(() => disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })

  it('Should return false if commonMessagingAgent is disconnected', async () => {
    mockCommonMessagingAgent.getVhosts.mockImplementationOnce(() => Promise.reject('error'))

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })

  it('Should return false if internalMQ is disconnected', async () => {
    checkerInstanceMock.checkRabbitMQ.mockImplementationOnce(() => disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })

  it('Should return false if apiSigner is disconnected', async () => {
    checkerInstanceMock.checkService.mockImplementationOnce(() => disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })
})
