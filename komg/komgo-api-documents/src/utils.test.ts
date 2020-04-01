import { enumValues, allUnique, doIdsMatch } from './utils'

enum TestEnum {
  ONE = 'one',
  TWO = 'two'
}

describe('utils', () => {
  it('extracts enum keys', () => {
    expect(enumValues(TestEnum)).toEqual(['one', 'two'])
  })

  it('is array with unique elements', () => {
    expect(allUnique(['a', 'b'])).toBe(true)
  })

  it('is array with non-unique elements', () => {
    expect(allUnique(['a', 'a', 'b'])).toBe(false)
  })

  it('do ids match', () => {
    expect(doIdsMatch(['1', '2', '3'], ['1', '2', '3'])).toBe(true)
    expect(doIdsMatch(['1', '2', '3'], ['1', '2', '3', '4', '5'])).toBe(false)
    expect(doIdsMatch(['1', '2', '3'], ['1', '2', '5'])).toBe(false)
  })
})
