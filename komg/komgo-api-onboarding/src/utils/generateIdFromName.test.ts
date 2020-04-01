import generateIdFromName from './generateIdFromName'

describe('generateIdFromName', () => {
  it('converts name to camelcase', () => {
    expect(generateIdFromName('Hello-123-!@#$%^&*()_+~|/-world')).toEqual('hello123World')
  })
})
