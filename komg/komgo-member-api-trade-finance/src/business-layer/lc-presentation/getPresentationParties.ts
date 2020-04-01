import { ILC } from '../../data-layer/models/ILC'
import { ILCPresentationParties } from '../../data-layer/models/ILCPresentationParties'

export const getPresentationParties = (lc: ILC): ILCPresentationParties => {
  const nominatedBankId = getNominatedBank(lc)

  return {
    applicantId: lc.applicantId,
    beneficiaryId: lc.beneficiaryId,
    issuingBankId: lc.issuingBankId,
    nominatedBankId
  }
}

const getNominatedBank = (lc: ILC): string => {
  if (lc.availableWith === 'AdvisingBank') {
    const bankId = lc.beneficiaryBankRole === 'AdvisingBank' ? lc.beneficiaryBankId : null

    if (!bankId) {
      throw new Error(`Can't resolve nominated bank`)
    }

    return bankId
  }
  return null
}
