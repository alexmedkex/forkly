import { IStateTransition } from '../store/types'
import { ILCPresentationDocument, LCPresentationStatus } from '../store/presentation/types'

export interface ILCPresentation {
  // _id?: string
  staticId: string
  beneficiaryId: string
  applicantId: string
  issuingBankId: string
  nominatedBankId?: string

  LCReference: string
  reference: string
  documents?: ILCPresentationDocument[]

  beneficiaryComments?: string
  nominatedBankComments?: string
  issuingBankComments?: string
  applicantComments?: string

  status: LCPresentationStatus
  stateHistory?: IStateTransition[]

  submittedAt?: Date

  destinationState?: LCPresentationStatus
}
