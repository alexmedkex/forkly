export * from './product'

export * from './category'

export * from './document-type'

export * from './document'

export * from './request'

export * from './template'

export * from './request-template'

export * from './request'

export * from './state'

export * from './modals'

export interface HasName {
  name: string
}

export interface HasId {
  id: string
}

export type Diff<T, U> = T extends U ? never : T // Remove types from T that are assignable to U
export type Filter<T, U> = T extends U ? T : never // Remove types from T that are not assignable to U
