import { Request } from 'express'

import { expressAuthentication } from './Authentication'

describe('authentication module', () => {
  it('just works', () => {
    const request = {} as Request
    expect(expressAuthentication(request, 'internal')).resolves.toEqual(null)
  })
})
