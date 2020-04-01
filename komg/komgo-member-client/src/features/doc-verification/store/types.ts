import { ImmutableMap } from '../../../utils/types'
import { Action } from 'redux'

export enum DocumentVerificationActionType {
  GET_SESSION_REQUEST = '@@licenses/GET_SESSION_REQUEST',
  GET_SESSION_SUCCESS = '@@licenses/GET_SESSION_SUCCESS',
  GET_SESSION_FAILURE = '@@licenses/GET_SESSION_FAILURE',
  VERIFY_DOCUMENT_REQUEST = '@@licenses/VERIFY_DOCUMENT_REQUEST',
  VERIFY_DOCUMENT_SUCCESS = '@@licenses/VERIFY_DOCUMENT_SUCCESS',
  VERIFY_DOCUMENT_FAILURE = '@@licenses/VERIFY_DOCUMENT_FAILURE'
}

export interface DocVerificationStateProperties {
  registeredAt: number
  companyName: string
  metadataHash: string
}

export type DocVerificationState = ImmutableMap<DocVerificationStateProperties>

export interface GetSessionRequest extends Action {
  type: DocumentVerificationActionType.GET_SESSION_REQUEST
}

export interface GetSessionSuccess extends Action {
  type: DocumentVerificationActionType.GET_SESSION_SUCCESS
  payload: { metadataHash: string }
}

export interface GetSessionFailure extends Action {
  type: DocumentVerificationActionType.GET_SESSION_FAILURE
  payload: string
}

export interface VerifyDocumentRequest extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST
}

export interface VerifyDocumentSuccess extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS
  payload: { registeredAt: number; companyName: string }
}

export interface VerifyDocumentFailure extends Action {
  type: DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE
  payload: string
}

export type DocumentVerificationActions =
  | GetSessionRequest
  | GetSessionSuccess
  | GetSessionFailure
  | VerifyDocumentRequest
  | VerifyDocumentSuccess
  | VerifyDocumentFailure
