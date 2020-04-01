import { ISharedDepositLoan, Currency, DepositLoanPeriod } from '@komgo/types'

export interface ISharedDepositLoanDataAgent {
  create(creditLine: ISharedDepositLoan): Promise<string>
  get(staticId: string): Promise<ISharedDepositLoan>
  findOne(query: object, projection?: object, options?: object): Promise<ISharedDepositLoan>
  find(query: object, projection?: object, options?: object): Promise<ISharedDepositLoan[]>
  findOneByDepositLoanAndCompanies(depositLoanId: string, companyStaticId: string)
  count(query?: object): Promise<number>
  delete(id: string): Promise<void>
  update(creditLine: ISharedDepositLoan): Promise<ISharedDepositLoan>
}
