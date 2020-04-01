import 'reflect-metadata'

const connected = {
  connected: true
}
const disconnected = {
  disconnected: true,
  error: 'string'
}
const checkerInstanceMock = {
  checkBlockchain: jest.fn().mockResolvedValue(connected),
  checkMongoDB: jest.fn().mockResolvedValue(connected),
  checkRabbitMQ: jest.fn().mockResolvedValue(connected),
  checkService: jest.fn().mockResolvedValue(connected)
}

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: checkerInstanceMock
}))

import IIsReadyChecker from './IIsReadyChecker'
import IsReadyChecker from './IsReadyChecker'

const API_REGISTRY_DOMAIN = 'http://api-registry'

describe('IsReadyChecker', () => {
  const web3Instance = {}
  let isReadyChecker: IIsReadyChecker

  beforeEach(() => {
    isReadyChecker = new IsReadyChecker(web3Instance as any, API_REGISTRY_DOMAIN)
  })

  it('Should return true if all serivces are connected', async () => {
    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(true)
  })

  it('Should return false if mongodb is disconnected', async () => {
    checkerInstanceMock.checkMongoDB.mockResolvedValueOnce(disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })

  it('Should return false if blockchain is disconnected', async () => {
    checkerInstanceMock.checkBlockchain.mockResolvedValueOnce(disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })

  it('Should return false if internalMQ is disconnected', async () => {
    checkerInstanceMock.checkRabbitMQ.mockResolvedValueOnce(disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })

  it('Should return false if apiRegistry is disconnected', async () => {
    checkerInstanceMock.checkService.mockResolvedValueOnce(disconnected)

    const isReady = await isReadyChecker.isReady()

    expect(isReady).toBe(false)
  })
})
