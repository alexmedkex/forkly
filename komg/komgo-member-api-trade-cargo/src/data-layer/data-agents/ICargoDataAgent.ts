import { ICargo } from '@komgo/types'

export interface ICargoDataAgent {
  create(trade: ICargo): Promise<string>
  update(id: string, data: ICargo): Promise<ICargo>
  delete(id: string, source: string): Promise<void>
  get(id: string, source: string): Promise<ICargo>
  find(query: object, projection: object, options: object): Promise<ICargo[]>
  findOne(query: object, source: string)
  count(query?: object): Promise<number>
}
