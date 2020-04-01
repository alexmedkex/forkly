const logger = {
  createLoggingMiddleware: jest.fn()
}
const loggingMiddleware = jest.fn()

const express = jest.fn()
const app = {
  use: jest.fn()
}

jest.mock('@komgo/logging', () => {
  return {
    // Mock default export of 'komgo/logging'
    default: logger
  }
})

jest.mock('express', () => {
  const expressStub: any = express
  expressStub.static = ''
  return expressStub
})

logger.createLoggingMiddleware.mockReturnValue(loggingMiddleware)
express.mockReturnValue(app)

import { ExpressConfig } from './Express'

describe('creating ExpressConfig', () => {
  it('created app parameter with express', () => {
    const expressConfig = new ExpressConfig()

    expect(expressConfig.app).toBe(app)
  })

  it('calls setupLogging with expressConfig.app', () => {
    const expressConfig = new ExpressConfig()

    expect(expressConfig.app.use).toHaveBeenCalledWith(loggingMiddleware)
  })
})
