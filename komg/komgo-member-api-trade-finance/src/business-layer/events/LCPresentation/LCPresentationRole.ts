import { ILCPresentation } from '../../../data-layer/models/ILCPresentation'
import { LCPresentationContractStatus } from './LCPresentationContractStatus'
import { ILCPresentationActionPerformer } from './eventProcessors/ILCPresentationActionPerformer'

export enum LCPresentationRole {
  Beneficiary = 'BENEFICIARY',
  NominatedBank = 'NOMINATED_BANK',
  IssuingBank = 'ISSUING_BANK',
  Applicant = 'APPLICANT'
}

export const getPerformer = (
  presentation: ILCPresentation,
  contractStatusAction: LCPresentationContractStatus
): ILCPresentationActionPerformer => {
  switch (contractStatusAction) {
    case LCPresentationContractStatus.DocumentsPresented:
      return {
        companyId: presentation.beneficiaryId,
        role: LCPresentationRole.Beneficiary
      }
    case LCPresentationContractStatus.DocumentsCompliantByNominatedBank:
    case LCPresentationContractStatus.DocumentsDiscrepantByNominatedBank:
      return {
        companyId: presentation.nominatedBankId,
        role: LCPresentationRole.NominatedBank
      }
    case LCPresentationContractStatus.DocumentsCompliantByIssuingBank:
    case LCPresentationContractStatus.DocumentsDiscrepantByIssuingBank:
      return {
        companyId: presentation.issuingBankId,
        role: LCPresentationRole.IssuingBank
      }
    case LCPresentationContractStatus.DocumentsReleasedToApplicant:
      return {
        companyId: presentation.issuingBankId,
        role: LCPresentationRole.IssuingBank
      }

    default:
      return getPerformerForAdviseDiscrepancies(presentation, contractStatusAction)
  }
}

export const getPerformerForAdviseDiscrepancies = (
  presentation: ILCPresentation,
  contractStatusAction: LCPresentationContractStatus
): ILCPresentationActionPerformer => {
  switch (contractStatusAction) {
    case LCPresentationContractStatus.DiscrepanciesAdvisedByNominatedBank:
      return {
        companyId: presentation.nominatedBankId,
        role: LCPresentationRole.NominatedBank
      }
    case LCPresentationContractStatus.DiscrepanciesAdvisedByIssuingBank:
      return {
        companyId: presentation.issuingBankId,
        role: LCPresentationRole.IssuingBank
      }
    case LCPresentationContractStatus.DiscrepanciesAcceptedByIssuingBank:
    case LCPresentationContractStatus.DiscrepanciesRejectedByIssuingBank:
      return {
        companyId: presentation.issuingBankId,
        role: LCPresentationRole.IssuingBank
      }
    case LCPresentationContractStatus.DocumentsAcceptedByApplicant:
    case LCPresentationContractStatus.DiscrepanciesRejectedByApplicant:
      return {
        companyId: presentation.applicantId,
        role: LCPresentationRole.Applicant
      }

    default:
      return null
  }
}

export const getCurrentPresentationRole = (
  presentation: ILCPresentation,
  companyId: string
): ILCPresentationActionPerformer => {
  const mapping = {
    [presentation.beneficiaryId]: LCPresentationRole.Beneficiary,
    [presentation.nominatedBankId]: LCPresentationRole.NominatedBank,
    [presentation.issuingBankId]: LCPresentationRole.IssuingBank,
    [presentation.applicantId]: LCPresentationRole.Applicant
  }

  if (mapping.hasOwnProperty(companyId) && mapping[companyId]) {
    return { companyId, role: mapping[companyId] }
  }

  return null
}
