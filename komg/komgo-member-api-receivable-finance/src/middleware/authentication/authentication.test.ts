import { expressAuthentication } from './authentication'
describe('authentication module', () => {
  it('just works', () => {
    expect(expressAuthentication({} as any, 'internal')).resolves.toEqual(null)
  })
})
