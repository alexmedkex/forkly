import { Trade } from '../models/Trade'
import { ITrade } from '@komgo/types'

export interface ITradeDataAgent {
  create(trade: Trade): Promise<string>
  update(id: string, data: Trade): Promise<ITrade>
  delete(id: string): Promise<void>
  get(id: string): Promise<ITrade>
  find(query: object, projection?: object, options?: object): Promise<ITrade[]>
  findOne(query: object, source: string): Promise<ITrade>
  count(query?: object): Promise<number>
}
