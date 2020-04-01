import { ILC } from '../../src/data-layer/models/ILC'
import { APPLICANT_ID } from '../../src/business-layer/messaging/mock-data/fakeLetterOfCredit'
import { LC_STATE } from '../../src/business-layer/events/LC/LCStates'
import { fakeCargo, fakeTrade } from '../../src/business-layer/messaging/mock-data/fakeTradeCargo'
import { TradeSource } from '@komgo/types'

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
  freeText:
    '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',
  tradeAndCargoSnapshot: undefined,
  nonce: 1
}

export const buildFakeLetterOfCredit = ({ status = LC_STATE.PENDING } = {}): ILC => {
  const trigram = 'BP'
  const refId = Math.floor(Math.random() * 100000) + 1
  return {
    status,
    _id: undefined,
    availableBy: 'DEFERRED_PAYMENT',
    beneficiaryId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
    expiryDate: '20200-12-31',
    contractAddress: '0xef3fbc3e228dbdc523ce5e58530874005553eb2e',
    transhipmentAllowed: false,
    issuingBankContactPerson: 'Scrooge',
    documentPresentationDeadlineDays: 21,
    direct: false,
    reference: `LC19-${trigram}-${refId}`,
    transactionHash: '0x001',
    feesPayableBy: 'OTHER',
    partialShipmentAllowed: true,
    issuingBankId: 'bankyMcBanky',
    availableWith: 'ISSUING_BANK',
    beneficiaryContactPerson: 'string',
    currency: 'EUR',
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
    applicantId: 'ecc3b179-00bc-499c-a2f9-f8d1cc58e9db',
    destinationState: null,
    tradeAndCargoSnapshot: {
      source: TradeSource.Komgo,
      sourceId: 'source',
      trade: fakeTrade(),
      cargo: fakeCargo()
    },
    billOfLadingEndorsement: 'Applicant',
    referenceObject: {
      trigram,
      value: refId,
      year: 2019
    },
    nonce: 1
  }
}
