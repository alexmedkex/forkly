export interface ISmartContractProvider {
  contractAddress: string
  getTruffleContract<T>(documentRegistryDomain: string): Promise<T>
}

export interface IDocumentRegistryV1SmartContract {
  getDocumentHashAndOwner(docId: string): Promise<string[]>
}

export interface IDocumentRegistrationInfo {
  companyStaticId: string
  timestamp: number
}

export interface IDocumentRegistrySmartContract {
  getRegistrationInfo(docContentHash: string): Promise<string[]>
}
