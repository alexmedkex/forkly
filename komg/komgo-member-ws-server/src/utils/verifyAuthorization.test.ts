const mockAxiosGet = jest.fn()
jest.mock('axios', () => ({
  get: mockAxiosGet
}))

import { verifyAuthorization } from './verifyAuthorization'

describe('verifyAuthorization', () => {
  it('verifyAuthorization', async () => {
    verifyAuthorization('')
    expect(mockAxiosGet).toHaveBeenCalled()
  })
})
