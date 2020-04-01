import { ICreditLine } from '@komgo/types'

export interface ICreditLineDataAgent {
  create(creditLine: ICreditLine): Promise<string>
  get(staticId: string): Promise<ICreditLine>
  findOne(query: object, projection?: object, options?: object): Promise<ICreditLine>
  find(query: object, projection?: object, options?: object): Promise<ICreditLine[]>
  count(query?: object): Promise<number>
  delete(id: string): Promise<void>
  update(creditLine: ICreditLine): Promise<ICreditLine>
}
