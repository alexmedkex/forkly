import { LogstashCapableLogger } from '@komgo/logging'
import { EventEmitter } from 'events'
import { createMockInstance } from 'jest-create-mock-instance'

import { logIndexCreation } from './logIndexCreation'

describe('logIndexCreation', () => {
  let logger: jest.Mocked<LogstashCapableLogger>
  let model: any

  beforeEach(() => {
    logger = createMockInstance(LogstashCapableLogger)
    logger.error = jest.fn()
    logger.info = jest.fn()

    model = new EventEmitter()
    model.collection = { name: 'test-collection' }
  })

  it('should log an info if the index is build successfully', async () => {
    logIndexCreation(logger, model)
    model.emit('index')
    expect(logger.info).toHaveBeenCalled()
  })

  it('should log an error if the index fails to be built', async () => {
    logIndexCreation(logger, model)
    model.emit('index', new Error())
    expect(logger.error).toHaveBeenCalled()
  })
})
