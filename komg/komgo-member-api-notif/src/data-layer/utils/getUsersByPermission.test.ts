const mockAxiosGet = jest.fn(() => ({ data: [{ id: 'test1' }, { id: 'test2' }] }))
jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet
  }
}))
import { getUserIDsByPermission, getUsersByPermission, getUserById } from './getUsersByPermission'

describe('getUserIDsByPermission', () => {
  it('should return user IDs', async () => {
    const res = await getUserIDsByPermission({ productId: 'test', actionId: 'test' })
    expect(res).toEqual(['test1', 'test2'])
  })
})

describe('getUsersByPermission', () => {
  it('should return users', async () => {
    const res = await getUsersByPermission({ productId: 'test', actionId: 'test' })
    expect(res).toEqual([{ id: 'test1' }, { id: 'test2' }])
  })
})

describe('getUserById', () => {
  it('should return users by ID', async () => {
    const res = await getUserById('idtest')
    expect(res).toEqual([{ id: 'test1' }, { id: 'test2' }])
  })
})
