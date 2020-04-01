import logger from '@komgo/logging'

import { GlobalActions } from './GlobalActions'

beforeAll(() => {
  if (process.env.INTEGRATION_TEST) {
    logger.info('Setting global jest timeout for integration tests...')
    jest.setTimeout(50000)
  }
})

afterEach(async () => {
  if (process.env.INTEGRATION_TEST) {
    await GlobalActions.cleanAllCollections()
  }
})
