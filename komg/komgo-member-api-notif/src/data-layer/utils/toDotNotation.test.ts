import { toDotNotation } from './toDotNotation'

describe('toDotNotationUtil', () => {
  const anonFieldName = 'foo'
  const anonEmbeddedValue = { herp: 'derp', bar: 3 }
  it(`given a field name and an object
  - returns an object for which
    - keys are fieldName.objectKey
    - values are object[objectKey] `, () => {
    const expected = {
      'foo.herp': 'derp',
      'foo.bar': 3
    }
    const actual = toDotNotation(anonFieldName, anonEmbeddedValue)
    expect(actual).toEqual(expected)
  })

  it('recurses on embedded objects within embedded objects.', () => {
    const anonDeeplyEmbedded = { baz: { a: 1, b: 2, c: [1, 2, 3] } }
    const doubleEmbedded = { ...anonEmbeddedValue, ...anonDeeplyEmbedded }
    const expected = {
      'foo.herp': 'derp',
      'foo.bar': 3,
      'foo.baz.a': 1,
      'foo.baz.b': 2,
      'foo.baz.c': [1, 2, 3]
    }

    const actual = toDotNotation(anonFieldName, doubleEmbedded)

    expect(actual).toEqual(expected)
  })
})
