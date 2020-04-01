export type PluckerFactory<T> = (collection: T[]) => Plucker<T>

export type Plucker<T> = (prop: keyof T) => Array<T[keyof T]>

export const PluckerFactory = <T>(collection: T[]): Plucker<T> => {
  return (prop: keyof T): Array<T[keyof T]> => {
    return collection.map(el => el[prop])
  }
}
