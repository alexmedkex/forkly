import { ImmutableMap, stringOrNull } from '../../../utils/types'
import { List, Map } from 'immutable'

import { Action } from 'redux'
import { Task } from '../../tasks/store/types'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
import { IFullDocumentRegisterResponse } from '../../review-documents/store/types'
import { ITrade } from '@komgo/types'
// TODO LS as soon the package is working use it
// import { ILetterOfCredit } from '@komgo/types'

export enum LetterOfCreditActionType {
  LETTERS_OF_CREDIT_REQUEST = '@@letters-of-credit/LETTERS_OF_CREDIT_REQUEST',
  LETTERS_OF_CREDIT_SUCCESS = '@@letters-of-credit/LETTERS_OF_CREDIT_SUCCESS',
  LETTERS_OF_CREDIT_FAILURE = '@@letters-of-credit/LETTERS_OF_CREDIT_FAILURE',
  LETTER_OF_CREDIT_REQUEST = '@@letters-of-credit/LETTER_OF_CREDIT_REQUEST',
  LETTER_OF_CREDIT_SUCCESS = '@@letters-of-credit/LETTER_OF_CREDIT_SUCCESS',
  LETTER_OF_CREDIT_FAILURE = '@@letters-of-credit/LETTER_OF_CREDIT_FAILURE',
  SORT_LETTERS_OF_CREDIT = '@@letters-of-credit/SORT_LETTERS_OF_CREDIT',
  SUBMIT_LETTER_OF_CREDIT_REQUEST = '@@letters-of-credit/SUBMIT_LETTER_OF_CREDIT_REQUEST',
  SUBMIT_LETTER_OF_CREDIT_SUCCESS = '@@letters-of-credit/SUBMIT_LETTER_OF_CREDIT_SUCCESS',
  SUBMIT_LETTER_OF_CREDIT_FAILURE = '@@letters-of-credit/SUBMIT_LETTER_OF_CREDIT_FAILURE',
  CLEAR_ERROR = '@@letters-of-credit/CLEAR_ERROR',
  CHANGE_ACTION_STATUS = '@@letters-of-credit/CHANGE_ACTION_STATUS',
  DOCUMENT_CREATED = '@@letters-of-credit/DOCUMENT_CREATED',
  DOCUMENT_CREATION_ERROR = '@@letters-of-credit/DOCUMENT_CREATION_ERROR'
}

export interface CreateLetterOfCreditDocumentRequest {
  context: any
  name: string
  categoryId: string
  documentTypeId: string
  parcelId: string
  file: File
  comment: string
}

export interface ICreateLetterOfCreditResponse {
  _id: string
  reference: string
}

export interface LetterOfCreditStateProperties {
  byId: Map<string, ILetterOfCredit>
  ids: List<string>
  error: stringOrNull
  fetching: number
  action: Map<string, ActionType>
}

export interface TableSortParams {
  column: string
  direction: string
  companyStaticId: string
  trades: ITrade[]
  tasks: Task[]
}

export interface UploadLCForm {
  issuingBankLCReference: string
  fileLC: File | null
  [k: string]: any
}

export interface ActionType {
  status: stringOrNull
  name: stringOrNull
  message?: string
}

export interface IStateTransition {
  fromState?: string
  toState: string
  performer: string
  date: string
}

export interface IStateTransitionEnriched extends IStateTransition {
  performerName: string
  comments?: string
}

export interface ILetterOfCreditDocumentResponse {
  blobFile: File
  tradeId: string
}

export interface LetterOfCreditParticipantNames {
  applicant: string
  beneficiary: string
  issuingBank: string
  beneficiaryBank: string
}

export type LetterOfCreditState = ImmutableMap<LetterOfCreditStateProperties>

export interface LetterOfCreditsReceivedAction extends Action {
  type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS
  // payload: IPaginate<ILetterOfCredit>
  payload: ILetterOfCredit[]
}

export interface LetterOfCreditReceivedAction extends Action {
  type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS
  payload: ILetterOfCredit
}

export interface LetterOfCreditsError extends Action {
  type:
    | LetterOfCreditActionType.LETTERS_OF_CREDIT_FAILURE
    | LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE
    | LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE
  payload: stringOrNull
}

export interface LetterOfCreditSubmittedResponseAction extends Action {
  type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_SUCCESS
  payload: ICreateLetterOfCreditResponse
}

export interface SortLettersOfCredit extends Action {
  type: LetterOfCreditActionType.SORT_LETTERS_OF_CREDIT
  payload: TableSortParams
}

export interface LetterOfCreditClearError extends Action {
  type: LetterOfCreditActionType.CLEAR_ERROR
}
export interface ChangeActionStatus extends Action {
  type: LetterOfCreditActionType.CHANGE_ACTION_STATUS
  payload: ActionType
}

export interface LetterOfCreditDocumentCreated extends Action {
  type: LetterOfCreditActionType.DOCUMENT_CREATED
  payload: IFullDocumentRegisterResponse
}

export interface LetterOfCreditDocumentError extends Action {
  type: LetterOfCreditActionType.DOCUMENT_CREATION_ERROR
  payload: stringOrNull
}

export type LetterOfCreditAction =
  | LetterOfCreditsReceivedAction
  | LetterOfCreditsError
  | LetterOfCreditReceivedAction
  | SortLettersOfCredit
  | LetterOfCreditSubmittedResponseAction
  | LetterOfCreditClearError
  | ChangeActionStatus
  | LetterOfCreditDocumentCreated
  | LetterOfCreditDocumentError
