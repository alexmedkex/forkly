import DataAccess from '@komgo/data-access'

import { connectToDb } from './connectToDb'

jest.mock('@komgo/data-access', () => ({
  default: {
    setUrl: jest.fn(),
    connect: jest.fn()
  }
}))

describe('connectToDb', () => {
  it('should call DataAccess.connect()', () => {
    connectToDb()

    expect(DataAccess.connect).toHaveBeenCalledWith()
  })
})
