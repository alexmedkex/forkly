export interface IMemberDAO {
  clearAll(): Promise<any>
  findByParentAndLabel(parent: string, label: string): Promise<any>
  createNewMemberCompany(parentNode: string, label: string, owner: string): Promise<any>
  updateOwner(node: string, newOwner: any): Promise<any>
  updateResolver(node: string, resolver: any): Promise<any>
  updateAddress(node: string, address: any): Promise<any>
  updateAbi(node: string, data: any): Promise<any>
  getMembers(companyData: string)
  addEthPubKey(
    node: string,
    xPublicKey: string,
    yPublicKey: string,
    address: string,
    effDate: number,
    termDate: number
  ): Promise<any>
  revokeEthPubKey(node: string, index: number): Promise<any>
  addKomgoMessagingPubKey(node: string, pubKey: string, effDate: number, termDate: number): Promise<any>
  revokeKomgoMessagingPubKey(node: string, index: number): Promise<any>
  addVaktMessagingPubKey(node: string, pubKey: string, effDate: number, termDate: number): Promise<any>
  revokeVaktMessagingPubKey(node: string, index: number): Promise<any>
  updateReverseNode(node: string, reverseNode: string): Promise<any>
  updateField(node: string, key: string, value: string): Promise<any>
}
