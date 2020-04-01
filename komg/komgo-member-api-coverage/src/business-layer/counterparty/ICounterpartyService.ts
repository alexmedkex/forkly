import { ICounterparty } from '../../service-layer/responses/ICounterparty'
import { ICoverageCompany } from '../registry/ICompany'

export interface ICounterpartyService {
  getCounterpartyRequest(requestId: string): any

  addCounterparty(companyId: string): Promise<void>
  addCounterpartyList(companyIds: string[]): Promise<void>
  autoAddCountepartyList(companyIds: string[]): Promise<void>
  resendCounterparty(companyId: string): Promise<void>

  addRequest(companyId: string, requestId: string): Promise<void>

  approveCounterparty(companyId: string): Promise<void>
  requestApproved(companyId: string, requestId: string): Promise<void>

  rejectCounterparty(companyId: string): Promise<void>
  requestRejected(companyId: string, requestId: string): Promise<void>

  getCounterparties(query: any): Promise<ICounterparty[]>
  getConnectedCounterpartiesWithRequests(query: any): Promise<ICounterparty[]>
  getCompanies(query: any): Promise<ICoverageCompany[]>
}
