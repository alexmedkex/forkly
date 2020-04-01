import { ICompanyRegistryService } from '../../src/service-layer/ICompanyRegistryService'

export class CompanyRegistryMockService implements ICompanyRegistryService {
  async getMember(staticId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getMembers(staticIds: string[]): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getNodeKeys(members: string[]): Promise<string[]> {
    return []
  }

  async getMembersByNode(nodes: string[]): Promise<any> {
    return []
  }
}
