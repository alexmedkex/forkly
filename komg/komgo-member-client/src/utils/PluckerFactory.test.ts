import { PluckerFactory } from './PluckerFactory'

interface Foo {
  bar: string
  baz: number
}

class Foo implements Foo {
  public bar: string
  public baz: number
  constructor(str: string, num: number) {
    this.bar = str
    this.baz = num
  }
}

const getCollection = (): Foo[] => [new Foo('abc', 1), new Foo('def', 2), new Foo('ghi', 3)]

const collection: Foo[] = getCollection()
const prop: keyof Foo = 'bar'
const expectedValue = ['abc', 'def', 'ghi']

describe('PluckerFactory', () => {
  describe('should be called with a collection', () => {
    const actual = PluckerFactory(collection)
    it('should return a function', () => {
      expect(actual).toBeDefined()
      expect(actual).toBeInstanceOf(Function)
    })
  })
})

describe('Plucker', () => {
  const pluckerInstance = PluckerFactory(collection)

  it('should be a function', () => {
    expect(pluckerInstance).toBeDefined()
    expect(pluckerInstance).toBeInstanceOf(Function)
  })

  it('should return a set of plucked properties', () => {
    const actual = pluckerInstance(prop)
    expect(actual).toBeDefined()
    expect(actual.length).toEqual(collection.length)
    expect(actual).toEqual(expectedValue)
  })
})
