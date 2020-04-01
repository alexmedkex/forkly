import { Map } from 'immutable'

export interface ImmutableMap<T> extends Map<keyof T, T[keyof T]> {
  toJS(): T
  get<G extends keyof T>(key: G): T[G]
  set<S extends keyof T>(key: S, value: T[S]): ImmutableMap<T>
}

export type stringOrNull = string | null
export type stringOrUndefined = string | undefined
export type boolOrUndefined = boolean | undefined

export interface IPaginate<T> {
  limit: number
  skip: number
  total: number
  items: T[]
}

export interface HasError {
  error: Error | null
}

// thanks to https://gist.github.com/jumpinjackie/82b6c794e3abc4bcf64d83bdbb387c23

type FilterFunction<T> = (item: ImmutableObject<T>) => boolean

export interface ImmutableList<T> {
  count(): number
  get(index: number): T extends object ? ImmutableObject<T> : T
  filter(FilterFunction): ImmutableList<T>
  find(FilterFunction): (T extends object ? ImmutableObject<T> : T) | undefined
}

export interface ImmutableObject<T> {
  get<P extends keyof T>(
    key: P
  ): T[P] extends Array<infer U> ? ImmutableList<U> : T[P] extends object ? ImmutableObject<T[P]> : T[P]
  toJS(): T
  has<P extends keyof T>(key: P): boolean
}
