import { logger } from './logger'

describe('logger', () => {
  it('is actually instance of Winston logger', () => {
    expect(logger).toBeTruthy()
  })
})
