import { TimerDurationUnit } from '@komgo/types'

export interface ICreateLCRequest {
  applicantId: string // must be valid ID in registry (komgo static id e.g. uuid)
  applicantContactPerson?: string

  beneficiaryId: string
  beneficiaryContactPerson?: string

  issuingBankId: string
  issuingBankContactPerson?: string

  direct: boolean // if false, we require beneficiaryBankId, if true we do not
  beneficiaryBankId?: string
  beneficiaryBankContactPerson?: string
  beneficiaryBankRole?: string // could be enum "Advising" / "Negotiating"

  feesPayableBy: string // enum Applicant / Beneficiary / Split

  type: string // "Irrevocable" is only valid option for now
  applicableRules: string // "UCP latest version" only valid option for now

  tradeId: string

  // LC details step
  currency: string
  amount: number
  expiryDate: Date | string | number
  expiryPlace: string
  availableWith: string
  availableBy: string
  partialShipmentAllowed?: boolean
  transhipmentAllowed?: boolean
  documentPresentationDeadlineDays: number

  comments?: string

  // cargo movement
  cargoIds: string[]
  reference?: string

  billOfLadingEndorsement?: string
  invoiceRequirement?: string
  templateType?: string
  freeTextLc?: string
  generatedPDF?: string

  LOI?: string
  LOIAllowed?: boolean
  LOIType?: string

  issueDueDateUnit?: TimerDurationUnit
  issueDueDateDuration?: number
}
