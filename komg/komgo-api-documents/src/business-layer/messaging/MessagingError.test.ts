import 'jest'
import 'reflect-metadata'

import MessagingError from './MessagingError'

const errorMsg = 'errorMsg'

describe('testName', () => {
  let error

  beforeEach(() => {
    jest.resetAllMocks()

    error = new MessagingError(errorMsg)
  })

  it('error message is assigned', async () => {
    expect(error.message).toEqual(errorMsg)
  })

  it('instanceof works correctly', async () => {
    expect(error).toBeInstanceOf(MessagingError)
  })
})
