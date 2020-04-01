import { getErrors } from './getErrors'

describe('getErrors', () => {
  it('should return error list', () => {
    const errors = getErrors({ a: 'error1', b: 'error2', c: { d: 'error3' } }, { a: true, c: { d: true } })
    expect(errors).toEqual(['error1', 'error3'])
  })
})
