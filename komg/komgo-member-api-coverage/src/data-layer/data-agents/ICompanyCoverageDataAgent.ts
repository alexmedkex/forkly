import { ICompanyCoverageDocument } from '../models/ICompanyCoverageDocument'

export interface ICompanyCoverageDataAgent {
  create(companyCoverage: ICompanyCoverageDocument): Promise<ICompanyCoverageDocument>
  update(coverageRequestId: string, data: ICompanyCoverageDocument): Promise<void>
  delete(coverageRequestId: string): Promise<void>
  get(companyId: string): Promise<ICompanyCoverageDocument>
  find(query: any): Promise<ICompanyCoverageDocument[]>
  findByCompanyIds(companyIds: string[], filter?: any): Promise<ICompanyCoverageDocument[]>
  findOne(query: any): Promise<ICompanyCoverageDocument>
}
