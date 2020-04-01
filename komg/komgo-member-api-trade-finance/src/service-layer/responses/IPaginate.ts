export interface IPaginate<T> {
  limit: number
  skip: number
  items: T
  total: number
}
