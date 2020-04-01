import { IDisclosedDepositLoan, DepositLoanType, IDisclosedDepositLoanSummary } from '@komgo/types'

export interface IDisclosedDepositLoanDataAgent {
  create(creditLine: IDisclosedDepositLoan): Promise<string>
  get(staticId: string): Promise<IDisclosedDepositLoan>
  delete(id: string): Promise<void>
  update(creditLine: IDisclosedDepositLoan): Promise<IDisclosedDepositLoan>

  findOne(type: DepositLoanType, query: object, projection?: object, options?: object): Promise<IDisclosedDepositLoan>
  find(type: DepositLoanType, query: object, projection?: object, options?: object): Promise<IDisclosedDepositLoan[]>
  count(type: DepositLoanType, query?: object): Promise<number>
  disclosedSummary(type: DepositLoanType, filter?): Promise<IDisclosedDepositLoanSummary[]>
}
