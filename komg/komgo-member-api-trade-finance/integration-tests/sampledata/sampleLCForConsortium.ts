import { ILC } from '../../src/data-layer/models/ILC'

export const APPLICANT_ID = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'

export const sampleLC: ILC = {
  applicantId: APPLICANT_ID,
  beneficiaryId: APPLICANT_ID,
  issuingBankId: APPLICANT_ID,
  beneficiaryBankId: APPLICANT_ID,
  type: 'IRREVOCABLE',
  direct: false,
  billOfLadingEndorsement: 'APPLICANT',
  currency: 'USD',
  amount: 2.1,
  expiryDate: '2018-12-22',
  feesPayableBy: 'SPLIT',
  applicableRules: 'UCP_LATEST_VERSION',
  cargoIds: [],
  expiryPlace: 'London',
  availableWith: 'ADVISING_BANK',
  availableBy: 'ACCEPTANCE',
  documentPresentationDeadlineDays: 21,
  template: 'free text template',
  partialShipmentAllowed: false,
  transhipmentAllowed: false,
  comments: 'a comment',
  freeText: 'asd',
  tradeAndCargoSnapshot: undefined
}
