const mockAxiosGet = jest.fn(() => ({
  data: [{ product: { id: 'test1' }, action: { id: 'test1' } }]
}))
jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet
  }
}))

jest.mock('./decodeBearerToken', () => ({
  decodeBearerToken: () => ({ realm_access: { roles: ['test'] } })
}))

import { getPermissionsByToken } from './getPermissionsByToken'

describe('getPermissionsByToken', () => {
  it('should return permissions', async () => {
    const res = await getPermissionsByToken('test')
    expect(res).toEqual([{ productId: 'test1', actionId: 'test1' }])
  })
})
