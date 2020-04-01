export interface IRegistryCacheDataAgent {
  clearCache(): Promise<any>
  saveSingleEvent(event): Promise<any>
  getMembers(companyData: string): Promise<any>
  getProducts(companyData: string): Promise<any>
}
