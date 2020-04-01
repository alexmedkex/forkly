export interface ICompanyRegistryService {
  getMember(staticId: string): Promise<any>
  getMembers(staticIds: string[]): Promise<any>
  getNodeKeys(members: string[]): Promise<string[]>
  getMembersByNode(nodes: string[]): Promise<any>
}
