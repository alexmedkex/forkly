const mockAxiosGet = jest.fn(() =>
  Promise.reject({
    message: 'Rejected'
  })
)
jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet
  }
}))

jest.mock('@komgo/logging', () => {
  const loggerMock = { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
  return { getLogger: () => loggerMock }
})

import { getUsers } from './getUsers'

describe('getUserIDsByPermission', () => {
  it('should return user IDs', async () => {
    const res = await getUsers('id')
    expect(res).toEqual([])
  })
})
