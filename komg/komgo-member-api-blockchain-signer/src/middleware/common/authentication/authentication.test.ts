import 'jest'
import { Request } from 'express'
import { expressAuthentication } from './authentication'

describe('authentication module', () => {
  it('just works', () => {
    const request = {} as Request
    expect(expressAuthentication(request, 'internal')).resolves.toEqual(null)
  })
})
