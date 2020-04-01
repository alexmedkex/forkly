export interface ISBLCTransactionManager {
  deploy(lcParams: object): Promise<string>
  issue(contractAddress: string, mt700: string, reference: string, issuingBankPostalAddress: string): Promise<string>
  requestReject(contractAddress: string, comment: string): Promise<string>
  // issuedSBLCRejectByBeneficiary(contractAddress: string, comment: string)
  // issuedSBLCRejectByAdvisingBank(contractAddress: string, comment: string)
  // advise(contractAddress: string): Promise<string>
  // acknowledge(contractAddress: string): Promise<string>
}
