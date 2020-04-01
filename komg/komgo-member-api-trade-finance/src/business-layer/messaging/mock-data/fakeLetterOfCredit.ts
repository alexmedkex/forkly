import { fakeTradeAndCargoSnapshot } from './fakeTradeCargo'
import { ILC } from '../../../data-layer/models/ILC'

export const APPLICANT_ID = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'

export const fakeLetterOfCredit = ({
  applicantId = 'ecc3b179-00bc-499c-a2f9-f8d1cc58e9db',
  beneficiaryId = '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
  reference = 'LC18-MER-1',
  tradeAndCargoSnapshot = fakeTradeAndCargoSnapshot(),
  status = null,
  beneficiaryBankId = '1234'
} = {}): ILC => ({
  applicantId,
  availableBy: 'DEFERRED_PAYMENT',
  beneficiaryId,
  beneficiaryBankId,
  expiryDate: '20200-12-31',
  contractAddress: '0xef3fbc3e228dbdc523ce5e58530874005553eb2e',
  transhipmentAllowed: false,
  issuingBankContactPerson: 'Scrooge',
  documentPresentationDeadlineDays: 21,
  direct: false,
  reference,
  transactionHash: '0x001',
  feesPayableBy: 'OTHER',
  partialShipmentAllowed: true,
  issuingBankId: 'bankyMcBank',
  availableWith: 'ISSUING_BANK',
  beneficiaryContactPerson: 'string',
  currency: 'EUR',
  status,
  applicantContactPerson: 'Donald Duck',
  comments: 'a comment',
  beneficiaryBankContactPerson: 'Mickey Mouse',
  expiryPlace: 'ISSUING_BANK',
  beneficiaryBankRole: 'ADVISING',
  amount: 1000000,
  applicableRules: 'UCP latest version',
  issuingBankReference: 'BK18-XX-1',
  type: 'IRREVOCABLE',
  cargoIds: [],
  destinationState: null,
  tradeAndCargoSnapshot,
  billOfLadingEndorsement: 'Applicant',
  referenceObject: {
    trigram: 'MER',
    year: 18,
    value: 1
  },
  nonce: 0
})
