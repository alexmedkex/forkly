const logger = require('winston')

beforeAll(() => {
  if (process.env.INTEGRATION_TESTS) {
    logger.info('Setting global jest timeout for integration test')
    jest.setTimeout(300000)
  }
})
