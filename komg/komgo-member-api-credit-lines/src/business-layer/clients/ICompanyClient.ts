import { ICompany } from './ICompany'

export interface ICompanyClient {
  getCompanies(query: any): Promise<ICompany[]>
  getCompanyByStaticId(staticId: string): Promise<ICompany>
}
