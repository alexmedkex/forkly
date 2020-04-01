import { ICoverageCompany } from './ICompany'

export interface ICompanyClient {
  getCompanies(query: any): Promise<ICoverageCompany[]>
  getCompanyByStaticId(staticId: string): Promise<ICoverageCompany>
}
