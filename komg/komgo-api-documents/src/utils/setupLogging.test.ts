import { configureLogging } from '@komgo/logging'

import { setUpLogging } from './setupLogging'

jest.mock('@komgo/logging', () => ({
  configureLogging: jest.fn(),
  default: {
    addLoggingToAxios: jest.fn()
  }
}))

describe('connectToDb', () => {
  it('should call configureLogging()', () => {
    process.env.CONTAINER_HOSTNAME = 'CONTAINER_HOSTNAME'
    setUpLogging()

    expect(configureLogging).toHaveBeenCalledWith('CONTAINER_HOSTNAME')
  })
})
