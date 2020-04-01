import { ITradeAndCargoSnapshot } from './ITradeAndCargoSnapshot'
import { TEMPLATE_TYPE_OPTIONS } from '../constants'
import { IStateTransition } from '../store/types'
import { ITimer } from '../../../store/common/types'

export interface ILetterOfCredit {
  // Ids
  _id?: string
  reference?: string
  transactionHash?: string

  // Trade
  tradeId?: string // used during the apply
  tradeAndCargoSnapshot?: ITradeAndCargoSnapshot // returned after the creation

  applicantId: string // must be valid ID in registry (komgo static id e.g. uuid)
  applicantContactPerson?: string

  beneficiaryId?: string
  beneficiaryContactPerson?: string

  issuingBankId?: string
  issuingBankContactPerson?: string

  direct?: boolean // if false, we require beneficiaryBankId, if true we do not
  beneficiaryBankId?: string
  beneficiaryBankContactPerson?: string
  beneficiaryBankRole?: string // could be enum "Advising" / "Negotiating"

  feesPayableBy?: string // enum Applicant / Beneficiary / Split

  type?: string // "Irrevocable" is only valid option for now
  applicableRules?: string // "UCP latest version" only valid option for now

  templateType: TEMPLATE_TYPE_OPTIONS
  freeTextLc?: string

  // LC details step
  currency?: string
  amount?: number
  expiryDate?: Date | string | number
  expiryPlace?: string
  availableWith?: string
  availableBy?: string
  partialShipmentAllowed?: boolean
  transhipmentAllowed?: boolean
  documentPresentationDeadlineDays?: number

  comments?: string

  issuingBankReference?: string
  status?: string
  billOfLadingEndorsement?: string // ISSUING_BANK or APPLICANT
  invoiceRequirement?: string

  LOI?: string
  LOIAllowed?: boolean
  LOIType?: string

  issuingBankComments?: string
  advisingBankComments?: string
  beneficiaryComments?: string

  stateHistory?: IStateTransition[]

  updatedAt?: Date | string | number

  timer?: ITimer
}

export enum ILetterOfCreditStatus {
  INITIALISING = 'initialising',
  REQUESTED = 'requested',
  REQUEST_REJECTED = 'request rejected',
  ISSUED_LC_REJECTED = 'issued lc rejected',
  ISSUED = 'issued',
  ADVISED = 'advised',
  ACKNOWLEDGED = 'acknowledged',
  COLLECTING = 'collecting',
  PENDING = 'pending',
  DRAFT = 'draft'
}
