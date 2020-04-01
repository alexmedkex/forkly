import { ILCAmendment } from '@komgo/types'

export interface ILCAmendmentDataAgent {
  create(amendment: ILCAmendment): Promise<string>
  update(conditions: any, amendment: ILCAmendment): Promise<void>
  delete(staticId: string): Promise<void>
  get(staticId: string): Promise<ILCAmendment>
  getByAddress(contractAddress: string): Promise<ILCAmendment>
  find(query: object, projection?: object, options?: object): Promise<ILCAmendment[]>
  count(query?: object): Promise<number>
}
