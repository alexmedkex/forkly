import SelectorFactory, { TSelectorFactory, Selector, Predicate, SelectedRecords } from './SelectorFactory'

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

const expectedDefaultPredicate: Foo = new Foo('abc', 1)
const expectedOverwritePredicate1: Foo = new Foo('def', 2)
const expectedOverwritePredicate2: Foo = new Foo('ghi', 3)

const getCollection = (): Foo[] => [new Foo('abc', 1), new Foo('def', 2), new Foo('ghi', 3)]

const collection: Foo[] = getCollection()

const expectedValue = 'abc'
const overwriteDefaultPredicate: Predicate<Foo> = (foo: Foo) => foo.bar !== expectedValue

const SelectorFactoryInstance: TSelectorFactory<Foo> = SelectorFactory
const SelectorInstance: Selector<Foo> = SelectorFactoryInstance(collection)
const SelectedRecordsInstance: SelectedRecords<Foo> = SelectorInstance()
const actual: Foo[] = SelectedRecordsInstance()

describe('SelectorFactory', () => {
  test('can be called with a collection', () => {
    expect(SelectorFactoryInstance(collection)).not.toThrow()
  })

  test('returns a Selector function', () => {
    expect(SelectorInstance).toBeDefined()
    expect(SelectorInstance).toBeInstanceOf(Function)
  })
})

describe('Selector', () => {
  test('Selector can be called with a value and a key, returns a function', () => {
    const sut = SelectorInstance()
    expect(SelectorInstance()).not.toThrow()
    expect(sut).toBeInstanceOf(Function)
  })

  test('Selector call can overwrite default Predicate', () => {
    const sut = SelectorInstance(overwriteDefaultPredicate)

    expect(SelectorInstance()).not.toThrow()
    expect(sut).toBeInstanceOf(Function)
    expect(sut()).toBeDefined()
    expect(sut().length).toEqual(2)
    expect(sut()[0]).toMatchObject(expectedOverwritePredicate1)
    expect(sut()[1]).toMatchObject(expectedOverwritePredicate2)
  })

  test('Selector does not mutate wrapping collection', () => {
    const predicateBar: Predicate<Foo> = el => el.bar === 'abc'
    const predicateBaz: Predicate<Foo> = el => el.baz === 123

    const A = SelectorFactoryInstance(collection)
    const B = SelectorFactoryInstance(collection)

    const selectorA = A(predicateBar)
    const selectorB = B(predicateBaz)

    const selectedB = selectorB()
    expect(selectedB.length).toEqual(0)

    const selectedA = selectorA()
    expect(selectedA.length).toEqual(1)
    expect(selectedA[0]).toMatchObject(new Foo('abc', 1))
  })
})

describe('SelectedRecords', () => {
  test('SelectedRecords contains the collection filtered by the property', () => {
    expect(actual.length).toEqual(3)
    expect(actual[0]).toMatchObject(expectedDefaultPredicate)
  })
})
