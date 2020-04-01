import { ILCPresentationDocument } from './ILCPresentationDocument'
import { LCPresentationStatus } from '@komgo/types'
import { IStateTransition } from './IStateTransition'
import { IContractReference } from './IContractReference'

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

  applicantComments?: string
  beneficiaryComments?: string
  nominatedBankComments?: string
  issuingBankComments?: string

  status: LCPresentationStatus
  stateHistory?: IStateTransition[]

  submittedAt?: Date
  contracts?: IContractReference[]

  destinationState?: LCPresentationStatus
}
