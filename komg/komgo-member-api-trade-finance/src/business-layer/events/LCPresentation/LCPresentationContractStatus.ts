import { LCPresentationStatus } from '@komgo/types'

const web3Utils = require('web3-utils')

export enum LCPresentationContractStatus {
  DocumentsPresented = 'docs presented',
  DocumentsCompliantByIssuingBank = 'docs compliant by issuingbank',
  DocumentsCompliantByNominatedBank = 'docs compliant by nominatedbank',
  DocumentsDiscrepantByNominatedBank = 'docs discrepant by nominatedbank',
  DocumentsDiscrepantByIssuingBank = 'docs discrepant by issuingbank',
  DocumentsReleasedToApplicant = 'docs released to applicant',

  DiscrepanciesAdvisedByNominatedBank = 'discrepancies advised by nominated bank',
  DiscrepanciesAdvisedByIssuingBank = 'discrepancies advised by issuing bank',

  DiscrepanciesAcceptedByIssuingBank = 'discrepancies accepted by issuing bank',
  DiscrepanciesRejectedByIssuingBank = 'discrepancies rejected by issuing bank',

  DocumentsAcceptedByApplicant = 'documents accepted by applicant',
  DiscrepanciesRejectedByApplicant = 'discrepancies rejected by applicant'
}

export const getLCPresentationStatus = (state: LCPresentationContractStatus): LCPresentationStatus => {
  switch (state) {
    case LCPresentationContractStatus.DocumentsPresented:
      return LCPresentationStatus.DocumentsPresented
    case LCPresentationContractStatus.DocumentsCompliantByNominatedBank:
      return LCPresentationStatus.DocumentsCompliantByNominatedBank
    case LCPresentationContractStatus.DocumentsDiscrepantByNominatedBank:
      return LCPresentationStatus.DocumentsDiscrepantByNominatedBank
    case LCPresentationContractStatus.DocumentsCompliantByIssuingBank:
      return LCPresentationStatus.DocumentsCompliantByIssuingBank
    case LCPresentationContractStatus.DocumentsDiscrepantByIssuingBank:
      return LCPresentationStatus.DocumentsDiscrepantByIssuingBank
    case LCPresentationContractStatus.DocumentsReleasedToApplicant:
      return LCPresentationStatus.DocumentsReleasedToApplicant
    default:
      return getLCPresentationStatusForDiscrepanceis(state)
  }
}

export const getLCPresentationStatusForDiscrepanceis = (state: LCPresentationContractStatus): LCPresentationStatus => {
  switch (state) {
    case LCPresentationContractStatus.DiscrepanciesAdvisedByNominatedBank:
      return LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
    case LCPresentationContractStatus.DiscrepanciesAdvisedByIssuingBank:
      return LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank

    case LCPresentationContractStatus.DiscrepanciesAcceptedByIssuingBank:
      return LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank

    case LCPresentationContractStatus.DiscrepanciesRejectedByIssuingBank:
      return LCPresentationStatus.DiscrepanciesRejectedByIssuingBank

    case LCPresentationContractStatus.DocumentsAcceptedByApplicant:
      return LCPresentationStatus.DocumentsAcceptedByApplicant
    case LCPresentationContractStatus.DiscrepanciesRejectedByApplicant:
      return LCPresentationStatus.DiscrepanciesRejectedByApplicant
    default:
      throw Error('Unknown status: ' + state)
  }
}

export const getContractStatusByHash = (hash: string): LCPresentationContractStatus => {
  const result = Object.values(LCPresentationContractStatus).filter(status => web3Utils.sha3(status) === hash)
  return result.length ? (result[0] as LCPresentationContractStatus) : null
}
