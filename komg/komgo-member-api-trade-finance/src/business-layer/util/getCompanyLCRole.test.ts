import { getCompanyLCRole } from './getCompanyLCRole'
import { ILC } from '../../data-layer/models/ILC'
import { COMPANY_LC_ROLE } from '../CompanyRole'

describe('getCompanyLCRole', () => {
  let lc: any

  beforeEach(() => {
    lc = {
      applicantId: '1',
      beneficiaryId: '2',
      issuingBankId: '3',
      beneficiaryBankId: '4'
    }
  })

  it('is applicant', () => {
    expect(getCompanyLCRole(lc.applicantId, lc)).toBe(COMPANY_LC_ROLE.Applicant)
  })

  it('is beneficay', () => {
    expect(getCompanyLCRole(lc.beneficiaryId, lc)).toBe(COMPANY_LC_ROLE.Beneficiary)
  })

  it('is issuing bank', () => {
    expect(getCompanyLCRole(lc.issuingBankId, lc)).toBe(COMPANY_LC_ROLE.IssuingBank)
  })

  it('is Advising bank', () => {
    lc.beneficiaryBankRole = 'ADVISING'
    expect(getCompanyLCRole(lc.beneficiaryBankId, lc)).toBe(COMPANY_LC_ROLE.AdvisingBank)
  })

  it('is Negotiating bank', () => {
    lc.beneficiaryBankRole = 'NEGOTIATING'
    expect(getCompanyLCRole(lc.beneficiaryBankId, lc)).toBe(COMPANY_LC_ROLE.NegotiatingBank)
  })

  it('it is not a party', () => {
    expect(getCompanyLCRole('----', lc)).toBe(COMPANY_LC_ROLE.NotParty)
  })
})
