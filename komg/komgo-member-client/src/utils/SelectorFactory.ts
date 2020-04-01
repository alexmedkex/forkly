export type Predicate<T> = (el: T) => boolean

export type TSelectorFactory<T> = (collection: T[]) => Selector<T>

export type Selector<T> = (predicate?: Predicate<T>) => SelectedRecords<T>

export type SelectedRecords<T> = () => T[]

export const simpleEquality = (a: any, b: any) => a === b

export const isTruthy = (a: any) => !!a

const SelectorFactory = <T>(collection: T[]) => {
  return function SelectorImpl(predicate: Predicate<T> = el => true) {
    // return function Selector(value: T[keyof T], prop: keyof T, predicate: Predicate<T> = (el: T) => simpleEquality(el[prop], value)) {
    return function SelectedRecordsImpl(): T[] {
      return collection.filter(predicate)
    }
  }
}

export default SelectorFactory
