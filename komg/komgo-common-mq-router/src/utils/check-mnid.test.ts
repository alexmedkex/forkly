import { checkMNID } from './check-mnid'

describe('checkMNID', () => {
  it('always returns true because currently that is mock', async () => {
    expect(await checkMNID('someMNID')).toBe(true)
  })
})
