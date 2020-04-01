import 'reflect-metadata'

import { Customer } from './Customer'

describe('Customer', () => {
  it('should not return _id in object', async () => {
    const result = new Customer()
    expect(result.toJSON()).not.toContain('_id')
  })
})
