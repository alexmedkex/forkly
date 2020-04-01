import { expressAuthentication } from './authentication'

describe('expressAuthentication', () => {
  it('call expressAuthentication', async () => {
    const res = await expressAuthentication({} as any, '')

    expect(res).toBeUndefined()
  })
})
