import { ITaskModel } from './ITaskModel'
import { IStateTransition } from './IStateTransition'
import { ITradeAndCargoSnapshot } from './ITradeAndCargoSnapshot'
import { IReferenceObject } from './IReferenceObject'

export interface ILC {
  _id?: string
  transactionHash?: string
  applicantId: string
  applicantContactPerson?: string
  beneficiaryId: string
  beneficiaryContactPerson?: string
  issuingBankId: string
  issuingBankContactPerson?: string
  direct: boolean
  beneficiaryBankId?: string
  beneficiaryBankContactPerson?: string
  beneficiaryBankRole?: string
  tradeAndCargoSnapshot?: ITradeAndCargoSnapshot

  feesPayableBy: string
  type: string
  applicableRules: string
  // LC details
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
  templateType?: string
  reason?: string
  amendmentId?: string
  parcelId?: string
  contractAddress?: string
  // cargo movement
  cargoIds: string[]
  reference?: string
  referenceObject?: IReferenceObject
  issuingBankReference?: string
  status?: string
  tasks?: ITaskModel[]
  template?: string

  issuingBankComments?: string
  advisingBankComments?: string
  beneficiaryComments?: string
  billOfLadingEndorsement?: string // Temporary optional
  invoiceRequirement?: string

  // documents
  commercialContractDocumentHash?: string
  draftLCDocumentHash?: string // Temporary, this should be made mandatory with Bo changes

  stateHistory?: IStateTransition[]

  LOI?: string
  LOIAllowed?: boolean
  LOIType?: string

  freeText?: string

  destinationState?: string
  nonce?: number

  issueDueDate?: {
    unit: string
    duration: number
    timerStaticId?: string
    timerType?: string
  }
  createdAt?: string
  updatedAt?: string
}
