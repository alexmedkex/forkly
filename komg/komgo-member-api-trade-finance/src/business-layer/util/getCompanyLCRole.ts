import { COMPANY_LC_ROLE } from '../CompanyRole'
import { ILC } from '../../data-layer/models/ILC'

export const getCompanyLCRole = (companyId: string, lc: ILC): COMPANY_LC_ROLE => {
  if (lc.applicantId === companyId) {
    return COMPANY_LC_ROLE.Applicant
  }

  if (lc.beneficiaryId === companyId) {
    return COMPANY_LC_ROLE.Beneficiary
  }

  if (lc.issuingBankId === companyId) {
    return COMPANY_LC_ROLE.IssuingBank
  }

  if (lc.beneficiaryBankId === companyId) {
    if (
      lc.beneficiaryBankRole.toLowerCase() === 'advisingbank' ||
      lc.beneficiaryBankRole === COMPANY_LC_ROLE.AdvisingBank
    ) {
      return COMPANY_LC_ROLE.AdvisingBank
    }

    if (
      lc.beneficiaryBankRole.toLowerCase() === 'negotiatingbank' ||
      lc.beneficiaryBankRole === COMPANY_LC_ROLE.NegotiatingBank
    ) {
      return COMPANY_LC_ROLE.NegotiatingBank
    }
  }

  return COMPANY_LC_ROLE.NotParty
}
