export interface ICachedData<T> {
  cached?: T
}

export interface ICacheOwnProps<T> {
  id: string
  data?: T
  children: (props: ICachedData<T>) => React.ReactElement
}
