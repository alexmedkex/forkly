import { green, grey, violetBlue } from '@komgo/ui-components'
import { TaskStatus } from '../tasks/store/types'

export const FILTERED_FIELDS = [
  'cargo.parcels',
  'cargo.sourceId',
  'cargo.source',
  'cargo.cargoId',
  'beneficiary.isFinancialInstitution',
  'beneficiary.isMember',
  'beneficiary.staticId',
  'applicant.isFinancialInstitution',
  'applicant.isMember',
  'applicant.staticId',
  'issuingBank.isFinancialInstitution',
  'issuingBank.isMember',
  'issuingBank.staticId',
  'beneficiaryBank.isFinancialInstitution',
  'beneficiaryBank.isMember',
  'beneficiaryBank.staticId',
  'trade.buyer',
  'trade.seller',
  'trade.sourceId',
  'trade.source',
  'version',
  'trade.demurrageTerms',
  'trade.laytime',
  'trade.paymentTermsOptionProvided'
]

export enum ReviewDecision {
  IssueSBLC = 'ISSUE_SBLC',
  RejectApplication = 'REJECT_APPLICATION'
}

export const ACTION_STATUS_TO_COLOR = {
  [TaskStatus.ToDo]: grey,
  [TaskStatus.InProgress]: violetBlue,
  [TaskStatus.Done]: green
}
