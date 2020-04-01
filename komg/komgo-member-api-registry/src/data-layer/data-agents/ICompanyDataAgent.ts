import Company from '../models/Company'
import { TransactionData } from '../models/TransactionData'

export interface ICompanyDataAgent {
  getCreateCompanyData(companyEnsLabel: string, companyAddress: string): Promise<TransactionData>
}
