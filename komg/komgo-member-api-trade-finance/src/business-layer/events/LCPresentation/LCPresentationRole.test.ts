import { ILCPresentation } from '../../../data-layer/models/ILCPresentation'
import { getCurrentPresentationRole, LCPresentationRole, getPerformer } from './LCPresentationRole'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationContractStatus } from './LCPresentationContractStatus'

const presentation: ILCPresentation = {
  staticId: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
  status: LCPresentationStatus.Draft,
  beneficiaryId: 'beneficiaryId',
  applicantId: 'applicantId',
  issuingBankId: 'issuingBankId',
  nominatedBankId: 'nominatedBankId',
  LCReference: 'lcref1',
  reference: 'ref1',
  documents: []
}

describe('LCPresentationRole', () => {
  it('get current role', async () => {
    expect(getCurrentPresentationRole(presentation, 'beneficiaryId')).toEqual({
      companyId: 'beneficiaryId',
      role: LCPresentationRole.Beneficiary
    })
    expect(getCurrentPresentationRole(presentation, 'applicantId')).toEqual({
      companyId: 'applicantId',
      role: LCPresentationRole.Applicant
    })
    expect(getCurrentPresentationRole(presentation, 'nominatedBankId')).toEqual({
      companyId: 'nominatedBankId',
      role: LCPresentationRole.NominatedBank
    })
    expect(getCurrentPresentationRole(presentation, 'issuingBankId')).toEqual({
      companyId: 'issuingBankId',
      role: LCPresentationRole.IssuingBank
    })
    expect(getCurrentPresentationRole(presentation, 'fail-id')).toEqual(null)
  })
})

describe('LCPresentationRole', () => {
  it('get performer', async () => {
    expect(getPerformer(presentation, LCPresentationContractStatus.DocumentsPresented)).toEqual({
      companyId: 'beneficiaryId',
      role: LCPresentationRole.Beneficiary
    })

    expect(getPerformer(presentation, LCPresentationContractStatus.DocumentsCompliantByNominatedBank)).toEqual({
      companyId: 'nominatedBankId',
      role: LCPresentationRole.NominatedBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DocumentsCompliantByIssuingBank)).toEqual({
      companyId: 'issuingBankId',
      role: LCPresentationRole.IssuingBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DocumentsReleasedToApplicant)).toEqual({
      companyId: 'issuingBankId',
      role: LCPresentationRole.IssuingBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DiscrepanciesAdvisedByIssuingBank)).toEqual({
      companyId: 'issuingBankId',
      role: LCPresentationRole.IssuingBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DiscrepanciesAcceptedByIssuingBank)).toEqual({
      companyId: 'issuingBankId',
      role: LCPresentationRole.IssuingBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DiscrepanciesRejectedByIssuingBank)).toEqual({
      companyId: 'issuingBankId',
      role: LCPresentationRole.IssuingBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DiscrepanciesAdvisedByNominatedBank)).toEqual({
      companyId: 'nominatedBankId',
      role: LCPresentationRole.NominatedBank
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DiscrepanciesRejectedByApplicant)).toEqual({
      companyId: 'applicantId',
      role: LCPresentationRole.Applicant
    })
    expect(getPerformer(presentation, LCPresentationContractStatus.DocumentsAcceptedByApplicant)).toEqual({
      companyId: 'applicantId',
      role: LCPresentationRole.Applicant
    })
    expect(getPerformer(presentation, 'fail-status' as any)).toEqual(null)
  })
})
