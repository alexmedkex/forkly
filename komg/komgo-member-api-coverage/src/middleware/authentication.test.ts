import { Request } from 'express'
import { expressAuthentication } from './authentication'

describe('authentication module', () => {
  it('just works', () => {
    // tslint:disable-next-line:no-object-literal-type-assertion
    const request = {} as Request
    expect(expressAuthentication(request, 'internal')).resolves.toEqual(null)
  })
})
