import { IDepositLoan } from '@komgo/types'

export interface IDepositLoanDataAgent {
  create(creditLine: IDepositLoan): Promise<string>
  get(staticId: string): Promise<IDepositLoan>
  findOne(query: object, projection?: object, options?: object): Promise<IDepositLoan>
  find(query: object, projection?: object, options?: object): Promise<IDepositLoan[]>
  count(query?: object): Promise<number>
  delete(id: string): Promise<void>
  update(creditLine: IDepositLoan): Promise<IDepositLoan>
}
