import * as SetUtils from './setUtils'

describe('set utils', () => {
  it('eqSet returns bool equality of two sets', () => {
    const setA = new Set([1, 2, 3])
    const setB = new Set([3, 2, 1])
    const actual = SetUtils.eqSet(setA, setB)
    expect(actual).toBe(true)
  })

  it('all returns result of a predicate against all members of a set', () => {
    const setA = new Set([1, 3, 5])
    const isOdd = (n: number) => n % 2 > 0

    const actual = SetUtils.all(isOdd, setA)
    expect(actual).toEqual(true)
  })

  it('isIn of a set curries .has of that set', () => {
    const setA = new Set([1])
    const actual = SetUtils.isIn(setA)(1)
    expect(actual).toEqual(true)
  })
})
