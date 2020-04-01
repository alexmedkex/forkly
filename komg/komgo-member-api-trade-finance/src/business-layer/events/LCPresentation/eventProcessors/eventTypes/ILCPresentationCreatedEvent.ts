import { LCPresentationContractStatus } from '../../LCPresentationContractStatus'

export interface ILCPresentationCreatedEvent {
  name: string
  beneficiaryGuid: string
  nominatedBankGuid: string
  issuingBankGuid: string
  applicantGuid: string
  tradeDocuments: [string[]]
  lcPresentationData: string
  lcAddress: string
  beneficiaryComments: string
  nominatedBankComments: string
  issuingBankComments: string
  currentStateId: string
  currentStateIdDecoded?: LCPresentationContractStatus
}

export interface ITradeDocument {
  documentHashes: string
  documentType: string
}
