export interface ICompanyRegistryAgent {
  getMnidFromStaticId(staticId: string): Promise<string>
  getEntryFromStaticId(staticId: string): Promise<any>
  getPropertyFromMnid(mnidType: string, mnid: string, property: string): Promise<string>
}
