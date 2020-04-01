import { Roles } from './constants/roles'
import { Counterparty } from '../../features/counterparties/store/types'
import { LOIText } from './constants/LetterOfIndemnityTemplate'
import { IDocumentReviewStatus } from '../review-documents/store/types'
import { Currency, Grade } from '@komgo/types'

export enum STEP {
  SUMMARY_OF_TRADE = 'SUMMARY_OF_TRADE',
  CARGO_MOVEMENTS = 'CARGO_MOVEMENTS',
  PARTICIPANTS = 'PARTICIPANTS',
  LC_TYPE = 'LC_TYPE',
  LC_DETAILS = 'LC_DETAILS',
  LC_DOCUMENTS = 'LC_DOCUMENTS',
  REVIEW = 'REVIEW'
}

interface BaseLetterOfCreditValues {
  applicantId: string
  applicantAddress?: string
  applicantCountry?: string
  applicantContactPerson?: string
  beneficiaryId?: string
  beneficiaryAddress?: string
  beneficiaryCountry?: string
  beneficiaryContactPerson?: string
  direct: boolean
  issuingBankId?: string
  issuingBankAddress?: string
  issuingBankCountry?: string
  issuingBankContactPerson?: string
  feesPayableBy?: string
  beneficiaryBankId?: string
  beneficiaryBankAddress?: string
  beneficiaryBankCountry?: string
  beneficiaryBankContactPerson?: string
  beneficiaryBankRole?: string
  type: TYPE_OPTIONS
  templateType: TEMPLATE_TYPE_OPTIONS
  freeTextLc?: string
  tradeId?: string
  billOfLadingEndorsement?: string
  currency: Currency
  amount: number
  expiryDate?: string
  expiryPlace: string
  availableWith?: string
  partialShipmentAllowed: boolean
  transhipmentAllowed: boolean
  documentPresentationDeadlineDays: number
  comments?: string
  cargoIds: string[]
  generatedPDF?: string
  LOIAllowed?: boolean
  LOI?: string
  LOIType?: LOI_TYPE_OPTIONS
  invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS
}

export interface LetterOfCreditValues extends BaseLetterOfCreditValues, Partial<WithDueDate> {
  applicableRules: APPLICABLE_RULES_OPTIONS
  availableBy: AVAILABLE_BY_OPTIONS
}

export interface ILetterOfCreditTemplate extends BaseLetterOfCreditValues {
  applicant: { name: string; locality: string }
  beneficiary: { name: string; locality: string }
  beneficiaryBank: { name: string; locality: string }
  issuingBank: { name: string; locality: string }
  grade?: string
  cargo: {
    deliveryPeriod?: IPeriod
    paymentTerms?: string
    price?: number
    currency?: string
    priceUnit?: string
    quantity?: number
    deliveryTerms?: string
    minTolerance?: number
    maxTolerance?: number
  }
  LOIAllowed: boolean
  LOI: string
  applicableRules: string
  availableBy: string
}

interface IPaymentsTerms {
  eventBase: string
  when: string
  time: number
  timeUnit: string
  dayType: string
}

interface IPeriod {
  startDate: string | number | Date
  endDate: string | number | Date
}

export const FEES_PAYABLE_BY_OPTIONS = {
  APPLICANT: Roles.APPLICANT.toUpperCase(),
  BENEFICIARY: Roles.BENEFICIARY.toUpperCase(),
  SPLIT: 'SPLIT'
}

export const FEES_PAYABLE_BY_TOOLTIP = {
  SPLIT: 'Issuing bank charges for Applicant, other bank charges for Beneficiary'
}

export const BENEFICIARY_BANK_ROLE_OPTIONS = {
  ADVISING: Roles.ADVISING_BANK
}

export enum TYPE_OPTIONS {
  IRREVOCABLE = 'IRREVOCABLE'
}

export enum APPLICABLE_RULES_OPTIONS {
  UCP_LATEST_VERSION = 'UCP_LATEST_VERSION'
}

export enum AVAILABLE_BY_OPTIONS {
  SIGHT_PAYMENT = 'SIGHT_PAYMENT',
  DEFERRED_PAYMENT = 'DEFERRED_PAYMENT',
  ACCEPTANCE = 'ACCEPTANCE',
  NEGOTIATION = 'NEGOTIATION'
}

export enum TEMPLATE_TYPE_OPTIONS {
  KOMGO_BFOET = 'KOMGO_BFOET',
  FREE_TEXT = 'FREE_TEXT'
}

export enum LOI_TYPE_OPTIONS {
  KOMGO_LOI = 'KOMGO_LOI',
  FREE_TEXT = 'FREE_TEXT'
}

export const TEMPLATE_TYPE_TOOLTIP = {
  FREE_TEXT: 'The review step in the form is not applicable if this option is chosen'
}

export const BILL_OF_LADING_ENDORSEMENT_OPTIONS = {
  ISSUING_BANK: Roles.ISSUING_BANK,
  APPLICANT: Roles.APPLICANT
}

export enum INVOICE_REQUIREMENT_OPTIONS {
  EXHAUSTIVE = 'EXHAUSTIVE',
  SIMPLE = 'SIMPLE'
}

export const AVAILABLE_WITH_OPTIONS = {
  ADVISING_BANK: Roles.ADVISING_BANK,
  ISSUING_BANK: Roles.ISSUING_BANK
}

export enum TIME_UNIT_DUE_DATE {
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS'
}

export const initialLetterOfCreditValues: LetterOfCreditValues = {
  type: TYPE_OPTIONS.IRREVOCABLE,
  direct: true,
  applicantId: '',
  billOfLadingEndorsement: BILL_OF_LADING_ENDORSEMENT_OPTIONS.ISSUING_BANK,
  currency: Currency.USD,
  amount: 0.0,
  applicantContactPerson: '',
  beneficiaryContactPerson: '',
  issuingBankContactPerson: '',
  beneficiaryBankContactPerson: '',
  feesPayableBy: FEES_PAYABLE_BY_OPTIONS.SPLIT,
  beneficiaryBankRole: BENEFICIARY_BANK_ROLE_OPTIONS.ADVISING,
  applicableRules: APPLICABLE_RULES_OPTIONS.UCP_LATEST_VERSION,
  availableBy: AVAILABLE_BY_OPTIONS.DEFERRED_PAYMENT,
  cargoIds: [],
  expiryPlace: Roles.ISSUING_BANK,
  availableWith: AVAILABLE_WITH_OPTIONS.ISSUING_BANK,
  documentPresentationDeadlineDays: 21,
  templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT,
  partialShipmentAllowed: true,
  transhipmentAllowed: false,
  LOIAllowed: true,
  LOIType: LOI_TYPE_OPTIONS.KOMGO_LOI,
  LOI: LOIText,
  invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE,
  issueDueDateActive: false
}

export const emptyCounterparty: Counterparty = {
  covered: false,
  staticId: '',
  isFinancialInstitution: false,
  x500Name: {
    CN: '',
    L: '',
    C: '',
    O: '',
    PC: '',
    STREET: ''
  },
  isMember: false
}

interface Document {
  name: string
  description: string
  controller?: any
}

export const documentsWhichOverrideLOI: Document[] = [
  {
    name: 'Certificate of Quality',
    description:
      'Independent inspectors certificate of quality and/or quality report at the loadport both showing sulphur content (if applicable).'
  },
  {
    name: 'Certificate of Quantity',
    description: 'Independent inspectors certificate of quantity and/or quantity report at the loadport.'
  },
  {
    name: 'Bill of Lading',
    description: `Full set original clean on board bills of lading issued or endorsed to the order of:`,
    controller: {
      options: BILL_OF_LADING_ENDORSEMENT_OPTIONS,
      fieldName: 'billOfLadingEndorsement'
    }
  },
  {
    name: 'Certificate of Origin',
    description: ''
  }
]

export const requiredDocuments: Document[] = [
  {
    name: 'Invoice',
    description: 'Beneficiary’s commercial invoice',
    controller: {
      options: INVOICE_REQUIREMENT_OPTIONS,
      fieldName: 'invoiceRequirement',
      extraInfo: {
        [INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE]: 'invoice requirement',
        [INVOICE_REQUIREMENT_OPTIONS.SIMPLE]: 'invoice requirement'
      }
    }
  },
  ...documentsWhichOverrideLOI
]

export const FIELD_ERROR_CLASSNAME = 'field error'
export const FIELD_DISABLED_CLASSNAME = 'field disabled'

export interface UploadLCForm {
  issuingBankLCReference: string
  fileLC: File | null
}

export interface RejectLCForm {
  rejectComment: string
  [field: string]: string
}

export enum ACTION_STATUS {
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
  PENDING = 'PENDING'
}

export enum ACTION_NAME {
  ISSUE_BANK_ISSUE_LC = 'ISSUE_LC',
  REJECT_LC = 'REJECT_LC',
  ACCEPT_LC = 'ACCEPT_LC'
}

export const FREE_TEXT_TEMPLATE_CHARACTER_LIMIT = 18000
export const ADDITIONAL_COMMENTS_CHARACTER_LIMIT = 500
export const LOI_TEMPLATE_CHARACTER_LIMIT = 5000

export enum PRESENTATION_DOCUMENT_STATUS {
  COMPLIANT = 'Compliant',
  DISCREPANT = 'Discrepant',
  PENDING = 'Pending'
}

export const mapDocReviewStatusesToPresentationDocStatues = {
  [IDocumentReviewStatus.ACCEPTED]: PRESENTATION_DOCUMENT_STATUS.COMPLIANT,
  [IDocumentReviewStatus.REJECTED]: PRESENTATION_DOCUMENT_STATUS.DISCREPANT,
  [IDocumentReviewStatus.PENDING]: PRESENTATION_DOCUMENT_STATUS.PENDING
}

interface WithDueDate {
  issueDueDateActive: boolean
  issueDueDateUnit: TIME_UNIT_DUE_DATE
  issueDueDateDuration: number
}

export interface TimerValidationRules {
  [key: string]: { min: number; max: number }
}

export const TIMER_VALIDATION_RULES: TimerValidationRules = {
  [TIME_UNIT_DUE_DATE.HOURS]: { min: 1, max: 167 },
  [TIME_UNIT_DUE_DATE.DAYS]: { min: 1, max: 7 },
  [TIME_UNIT_DUE_DATE.WEEKS]: { min: 1, max: 1 }
}
