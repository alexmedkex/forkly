import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { LCPresentationStatus } from '@komgo/types'

export const resolveCompliantStatus = (
  presentation: ILCPresentation,
  companyStaticId: string
): LCPresentationStatus | { error: string } => {
  if (presentation.issuingBankId === companyStaticId) {
    if (!presentation.nominatedBankId) {
      // no nominated bank
      if (presentation.status !== LCPresentationStatus.DocumentsPresented) {
        return { error: 'Presentation should be in the "DocumentPresented" state for issuing bank' }
      }
    } else {
      // has nominated bank
      if (presentation.status !== LCPresentationStatus.DocumentsCompliantByNominatedBank) {
        return { error: 'Presentation should be in the "DocumentsCompliantByNominatedBank" state' }
      }
    }

    return LCPresentationStatus.DocumentsCompliantByIssuingBank
  } else if (presentation.nominatedBankId === companyStaticId) {
    // is nominated bank
    if (presentation.status !== LCPresentationStatus.DocumentsPresented) {
      return { error: 'Presentation should be in the "DocumentPresented" state for nominated bank' }
    }

    return LCPresentationStatus.DocumentsCompliantByNominatedBank
  }

  return { error: `Must be issuing or nominated bank` }
}

export const resolveDisrepantStatus = (
  presentation: ILCPresentation,
  companyStaticId: string
): LCPresentationStatus | { error: string } => {
  if (presentation.issuingBankId === companyStaticId) {
    if (!presentation.nominatedBankId) {
      // no nominated bank
      if (presentation.status !== LCPresentationStatus.DocumentsPresented) {
        return { error: 'Presentation should be in the "DocumentPresented" state for issuing bank' }
      }
    } else {
      // has nominated bank
      if (presentation.status !== LCPresentationStatus.DocumentsCompliantByNominatedBank) {
        return { error: 'Presentation should be in the "DocumentsCompliantByNominatedBank" state' }
      }
    }

    return LCPresentationStatus.DocumentsDiscrepantByIssuingBank
  } else if (presentation.nominatedBankId === companyStaticId) {
    // is nominated bank
    if (presentation.status !== LCPresentationStatus.DocumentsPresented) {
      return { error: 'Presentation should be in the "DocumentPresented" state for nominated bank' }
    }

    return LCPresentationStatus.DocumentsDiscrepantByNominatedBank
  }

  return { error: `Must be issuing or nominated bank` }
}

export const resolveAdviseStatus = (
  presentation: ILCPresentation,
  companyStaticId: string
): LCPresentationStatus | { error: string } => {
  if (presentation.status !== LCPresentationStatus.DocumentsPresented) {
    return { error: 'Presentation should be in the "DocumentPresented" state for advising discrepancies' }
  }

  if (presentation.nominatedBankId === companyStaticId) {
    return LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
  }

  if (presentation.issuingBankId === companyStaticId) {
    return LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank
  }

  return { error: 'Must be issuing or nominated bank' }
}

export const resolveDiscrepanciesAcceptStatus = (
  presentation: ILCPresentation,
  companyStaticId: string
): LCPresentationStatus | { error: string } => {
  if (presentation.status === LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank) {
    if (presentation.issuingBankId !== companyStaticId) {
      return { error: 'Must be issuing bank' }
    }

    return LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
  }

  if (
    presentation.status === LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank ||
    presentation.status === LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
  ) {
    if (presentation.applicantId !== companyStaticId) {
      return { error: 'Must be applicant' }
    }

    return LCPresentationStatus.DocumentsAcceptedByApplicant
  }

  return { error: 'Invalid presentation status or party' }
}

export const resolveDiscrepanciesRejectStatus = (
  presentation: ILCPresentation,
  companyStaticId: string
): LCPresentationStatus | { error: string } => {
  if (presentation.status === LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank) {
    if (presentation.issuingBankId !== companyStaticId) {
      return { error: 'Must be issuing bank' }
    }

    return LCPresentationStatus.DiscrepanciesRejectedByIssuingBank
  }

  if (
    presentation.status === LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank ||
    presentation.status === LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
  ) {
    if (presentation.applicantId !== companyStaticId) {
      return { error: 'Must be applicant' }
    }

    return LCPresentationStatus.DiscrepanciesRejectedByApplicant
  }

  return { error: 'Invalid presentation status or party' }
}
