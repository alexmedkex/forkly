import { ImmutableMap } from '../../../utils/types'
import { Action } from 'redux'
import { List } from 'immutable'

export enum DocumentVerificationActionType {
  VERIFY_DOCUMENT_ADD_FILE = '@@verifying/VERIFY_DOCUMENT_ADD_FILE',
  VERIFY_DOCUMENT_REQUEST = '@@verifying/VERIFY_DOCUMENT_REQUEST',
  VERIFY_DOCUMENT_SUCCESS = '@@verifying/VERIFY_DOCUMENT_SUCCESS',
  VERIFY_DOCUMENT_FAILURE = '@@verifying/VERIFY_DOCUMENT_FAILURE'
}

export enum IStatus {
  success = 'success',
  error = 'error',
  pending = 'pending'
}

export interface IVerifiedFile {
  key: number
  type: string
  status: IStatus
  fileName: string
  hash: string
  iconColor?: string
  registeredAt?: string
  registeredBy?: string
}

export interface DocumentVerificationStateProperties {
  registeredAt: number
  files: List<IVerifiedFile>
}

export type DocumentVerificationState = ImmutableMap<DocumentVerificationStateProperties>

export interface VerifyDocumentAddFile extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_ADD_FILE
  payload: { file: IVerifiedFile }
}

export interface VerifyDocumentRequest extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST
}

export interface VerifyDocumentSuccess extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS
  payload: {
    file: IVerifiedFile
    response: {
      registered: boolean
      deactivated: boolean
      documentInfo?: {
        registeredAt?: string
        registeredBy?: string
      }
    }
  }
}

export interface VerifyDocumentFailure extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE
  payload: { file: IVerifiedFile; response: string }
}

export type DocumentVerificationActions =
  | VerifyDocumentAddFile
  | VerifyDocumentRequest
  | VerifyDocumentSuccess
  | VerifyDocumentFailure
