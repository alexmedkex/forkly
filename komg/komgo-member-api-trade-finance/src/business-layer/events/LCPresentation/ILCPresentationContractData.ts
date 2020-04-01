export interface ILCPresentationContractData {
  jsonData: string
  lcAddress: string
  beneficiaryComments: string
  nominatedBankComments: string
  issuingBankComments: string
  lcPresentationReference: string
  lcReference: string
}

export interface ILCPresentationContractCustomData {
  staticId: string
  lcPresentationReference: string
  lcReference: string
}
