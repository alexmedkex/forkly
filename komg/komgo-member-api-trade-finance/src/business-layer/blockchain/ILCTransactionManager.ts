export interface ILCTransactionManager {
  deployLC(lcParams: object): Promise<string>
  issueLC(contractAddress: string, mt700: string, reference: string): Promise<string>
  requestRejectLC(contractAddress: string, comment: string): Promise<string>
  issuedLCRejectByBeneficiary(contractAddress: string, comment: string)
  issuedLCRejectByAdvisingBank(contractAddress: string, comment: string)
  adviseLC(contractAddress: string): Promise<string>
  acknowledgeLC(contractAddress: string): Promise<string>
}
