const mockAxiosGet = jest.fn()
jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet
  }
}))
import { getUserById } from './getUserById'

describe('getUserById', () => {
  it('should call mockAxiosGet', async () => {
    await getUserById('test')
    expect(mockAxiosGet).toHaveBeenCalled()
  })
})
