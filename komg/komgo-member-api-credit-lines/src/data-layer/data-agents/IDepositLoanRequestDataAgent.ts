import { DepositLoanType, DepositLoanPeriod, Currency } from '@komgo/types'

import { IDepositLoanRequestDocument } from '../models/IDepositLoanRequestDocument'

export interface IDepositLoanRequestDataAgent {
  create(depositLoanRequest: IDepositLoanRequestDocument): Promise<string>
  get(type: DepositLoanType, staticId: string): Promise<IDepositLoanRequestDocument>
  findOne(query: object, projection?: object, options?: object): Promise<IDepositLoanRequestDocument>
  find(query: object, projection?: object, options?: object): Promise<IDepositLoanRequestDocument[]>
  findForCompaniesAndType(
    type: DepositLoanType,
    companyStaticId: string,
    currency: Currency,
    period: DepositLoanPeriod,
    periodDuration: number,
    filter?: object
  ): Promise<IDepositLoanRequestDocument[]>
  count(query?: object): Promise<number>
  delete(id: string): Promise<void>
  update(depositLoanRequest: IDepositLoanRequestDocument): Promise<IDepositLoanRequestDocument>
}
