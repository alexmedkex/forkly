export interface ICounterpartyClient {
  autoAdd(companyIds: string[]): Promise<void>
}
