export enum LCPresentationAction {
  nominatedBankSetDocumentsCompliant = 'nominatedBankSetDocumentsCompliant',
  nominatedBankSetDocumentsDiscrepant = 'nominatedBankSetDocumentsDiscrepant',
  issuingBankSetDocumentsCompliant = 'issuingBankSetDocumentsCompliant',
  issuingBankSetDocumentsDiscrepant = 'issuingBankSetDocumentsDiscrepant',

  nominatedBankAdviseDiscrepancies = 'nominatedBankAdviseDiscrepancies',
  issungBankAdviseDiscrepancies = 'issungBankAdviseDiscrepancies',
  issuingBankSetDiscrepanciesAccepted = 'issuingBankSetDiscrepanciesAccepted',
  issuingBankSetDiscrepanciesRejected = 'issuingBankSetDiscrepanciesRejected',
  applicantSetDiscrepanciesAccepted = 'applicantSetDiscrepanciesAccepted',
  applicantSetDiscrepanciesRejected = 'applicantSetDiscrepanciesRejected'
}

export type LCPresentationActionType = keyof typeof LCPresentationAction
