import { IDisclosedCreditLine } from '../models/IDisclosedCreditLine'
import { IDisclosedCreditLineSummary } from '../models/IDisclosedCreditLineSummary'

export interface IDisclosedCreditLineDataAgent {
  create(disclosedCreditLine: IDisclosedCreditLine): Promise<string>
  get(ownerStaticId: string): Promise<IDisclosedCreditLine>
  findOne(query: object, projection?: object, options?: object): Promise<IDisclosedCreditLine>
  find(query: object, projection?: object, options?: object): Promise<IDisclosedCreditLine[]>
  count(query?: object): Promise<number>
  delete(id: string): Promise<void>
  update(disclosedCreditLine: IDisclosedCreditLine): Promise<IDisclosedCreditLine>
  disclosedSummary(context, filter?): Promise<IDisclosedCreditLineSummary[]>
}
