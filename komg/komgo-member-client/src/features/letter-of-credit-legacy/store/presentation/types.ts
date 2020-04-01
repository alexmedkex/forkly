import { Action } from 'redux'
import { ILCPresentation } from '../../types/ILCPresentation'
import { ImmutableMap } from '../../../../utils/types'
import { Map, List } from 'immutable'
import { Document } from '../../../document-management'

export interface LCPresentationStateProps {
  byLetterOfCreditReference: Map<string, List<ILCPresentation>>
  documentsByPresentationId: Map<string, List<Document>>
  vaktDocuments: Map<string, List<Document>>
}

export type LCPresentationState = ImmutableMap<LCPresentationStateProps>

export enum LCPresentationActionType {
  FETCH_PRESENTATIONS_REQUEST = '@@letters-of-credit-presentation/FETCH_PRESENTATIONS_REQUEST',
  FETCH_PRESENTATIONS_FAILURE = '@@letters-of-credit-presentation/FETCH_PRESENTATIONS_FAILURE',
  FETCH_PRESENTATIONS_SUCCESS = '@@letters-of-credit-presentation/FETCH_PRESENTATIONS_SUCCESS',
  CREATE_PRESENTATION_REQUEST = '@@letters-of-credit-presentation/CREATE_PRESENTATION_REQUEST',
  CREATE_PRESENTATION_SUCCESS = '@@letters-of-credit-presentation/CREATE_PRESENTATION_SUCCESS',
  CREATE_PRESENTATION_FAILURE = '@@letters-of-credit-presentation/CREATE_PRESENTATION_FAILURE',
  FETCH_PRESENTATION_DOCUMENTS_REQUEST = '@@letters-of-credit-presentation/FETCH_PRESENTATION_DOCUMENTS_REQUEST',
  FETCH_PRESENTATION_DOCUMENTS_FAILURE = '@@letters-of-credit-presentation/FETCH_PRESENTATION_DOCUMENTS_FAILURE',
  FETCH_PRESENTATION_DOCUMENTS_SUCCESS = '@@letters-of-credit-presentation/FETCH_PRESENTATION_DOCUMENTS_SUCCESS',
  FETCH_VAKT_DOCUMENTS_REQUEST = '@@letters-of-credit-presentation/FETCH_VAKT_DOCUMENTS_REQUEST',
  FETCH_VAKT_DOCUMENTS_FAILURE = '@@letters-of-credit-presentation/FETCH_VAKT_DOCUMENTS_FAILURE',
  FETCH_VAKT_DOCUMENTS_SUCCESS = '@@letters-of-credit-presentation/FETCH_VAKT_DOCUMENTS_SUCCESS',
  ATTACH_VAKT_DOCUMENTS_REQUEST = '@@letters-of-credit-presentation/ATTACH_VAKT_DOCUMENTS_REQUEST',
  ATTACH_VAKT_DOCUMENTS_FAILURE = '@@letters-of-credit-presentation/ATTACH_VAKT_DOCUMENTS_FAILURE',
  ATTACH_VAKT_DOCUMENTS_SUCCESS = '@@letters-of-credit-presentation/ATTACH_VAKT_DOCUMENTS_SUCCESS',
  REMOVE_PRESENTATION_REQUEST = '@@letters-of-credit-presentation/REMOVE_PRESENTATION_REQUEST',
  REMOVE_PRESENTATION_FAILURE = '@@letters-of-credit-presentation/REMOVE_PRESENTATION_FAILURE',
  REMOVE_PRESENTATION_SUCCESS = '@@letters-of-credit-presentation/REMOVE_PRESENTATION_SUCCESS',
  REMOVE_PRESENTATION_DOCUMENT_REQUEST = '@@letters-of-credit-presentation/REMOVE_PRESENTATION_DOCUMENT_REQUEST',
  REMOVE_PRESENTATION_DOCUMENT_FAILURE = '@@letters-of-credit-presentation/REMOVE_PRESENTATION_DOCUMENT_FAILURE',
  REMOVE_PRESENTATION_DOCUMENT_SUCCESS = '@@letters-of-credit-presentation/REMOVE_PRESENTATION_DOCUMENT_SUCCESS',
  UPLOAD_PRESENTATION_DOCUMENT_REQUEST = '@@letters-of-credit-presentation/UPLOAD_PRESENTATION_DOCUMENT_REQUEST',
  UPLOAD_PRESENTATION_DOCUMENT_FAILURE = '@@letters-of-credit-presentation/UPLOAD_PRESENTATION_DOCUMENT_FAILURE',
  UPLOAD_PRESENTATION_DOCUMENT_SUCCESS = '@@letters-of-credit-presentation/UPLOAD_PRESENTATION_DOCUMENT_SUCCESS',
  SUBMIT_PRESENTATION_REQUEST = '@@letters-of-credit-presentation/SUBMIT_PRESENTATION_REQUEST',
  SUBMIT_PRESENTATION_FAILURE = '@@letters-of-credit-presentation/SUBMIT_PRESENTATION_FAILURE',
  SUBMIT_PRESENTATION_SUCCESS = '@@letters-of-credit-presentation/SUBMIT_PRESENTATION_SUCCESS',
  SET_PRESENTATION_DOCUMENTS_COMPLIANT_REQUEST = '@@letters-of-credit-presentation/SET_PRESENTATION_DOCUMENTS_COMPLIANT_REQUEST',
  SET_PRESENTATION_DOCUMENTS_COMPLIANT_FAILURE = '@@letters-of-credit-presentation/SET_PRESENTATION_DOCUMENTS_COMPLIANT_FAILURE',
  SET_PRESENTATION_DOCUMENTS_COMPLIANT_SUCCESS = '@@letters-of-credit-presentation/SET_PRESENTATION_DOCUMENTS_COMPLIANT_SUCCESS',
  FETCH_PRESENTATION_RECEIVED_DOCUMENTS_REQUEST = '@@letters-of-credit-presentation/FETCH_PRESENTATION_RECEIVED_DOCUMENTS_REQUEST',
  FETCH_PRESENTATION_RECEIVED_DOCUMENTS_FAILURE = '@@letters-of-credit-presentation/FETCH_PRESENTATION_RECEIVED_DOCUMENTS_FAILURE',
  FETCH_PRESENTATION_RECEIVED_DOCUMENTS_SUCCESS = '@@letters-of-credit-presentation/FETCH_PRESENTATION_RECEIVED_DOCUMENTS_SUCCESS',
  SET_PRESENTATION_DOCUMENTS_DISCREPANT_REQUEST = '@@letters-of-credit-presentation/SET_PRESENTATION_DOCUMENTS_DISCREPANT_REQUEST',
  SET_PRESENTATION_DOCUMENTS_DISCREPANT_FAILURE = '@@letters-of-credit-presentation/SET_PRESENTATION_DOCUMENTS_DISCREPANT_FAILURE',
  SET_PRESENTATION_DOCUMENTS_DISCREPANT_SUCCESS = '@@letters-of-credit-presentation/SET_PRESENTATION_DOCUMENTS_DISCREPANT_SUCCESS',
  REQ_WAIVER_OF_DISCREPANCIES_REQUEST = '@@letters-of-credit-presentation/REQ_WAIVER_OF_DISCREPANCIES_REQUEST',
  REQ_WAIVER_OF_DISCREPANCIES_FAILURE = '@@letters-of-credit-presentation/REQ_WAIVER_OF_DISCREPANCIES_FAILURE',
  REQ_WAIVER_OF_DISCREPANCIES_SUCCESS = '@@letters-of-credit-presentation/REQ_WAIVER_OF_DISCREPANCIES_SUCCESS',
  ACCEPT_REQUESTED_DISCREPANCIES_REQUEST = '@@letters-of-credit-presentation/ACCEPT_REQ_DISCREPANCIES_REQUEST',
  ACCEPT_REQUESTED_DISCREPANCIES_FAILURE = '@@letters-of-credit-presentation/ACCEPT_REQ_DISCREPANCIES_FAILURE',
  ACCEPT_REQUESTED_DISCREPANCIES_SUCCESS = '@@letters-of-credit-presentation/ACCEPT_REQ_DISCREPANCIES_SUCCESS',
  REJECT_REQUESTED_DISCREPANCIES_REQUEST = '@@letters-of-credit-presentation/REJECT_REQ_DISCREPANCIES_REQUEST',
  REJECT_REQUESTED_DISCREPANCIES_FAILURE = '@@letters-of-credit-presentation/REJECT_REQ_DISCREPANCIES_FAILURE',
  REJECT_REQUESTED_DISCREPANCIES_SUCCESS = '@@letters-of-credit-presentation/REJECT_REQ_DISCREPANCIES_SUCCESS'
}

export interface ILCPresentationDocument {
  documentId: string
  documentHash: string
  status: LCPresentationDocumentStatus
  documentTypeId: string
  dateProvided: Date
}

export enum LCPresentationDocumentStatus {
  Draft = 'DRAFT',
  Submitted = 'SUBMITTED'
}

export enum LCPresentationStatus {
  Draft = 'DRAFT',
  DocumentsPresented = 'DOCUMENTS_PRESENTED',
  DocumentsCompliantByIssuingBank = 'DOCUMENTS_COMPLIANT_BY_ISSUING_BANK',
  DocumentsCompliantByNominatedBank = 'DOCUMENTS_COMPLIANT_BY_NOMINATED_BANK',
  DocumentsDiscrepantByIssuingBank = 'DOCUMENTS_DISCREPANT_BY_ISSUING_BANK',
  DocumentsDiscrepantByNominatedBank = 'DOCUMENTS_DISCREPANT_BY_NOMINATED_BANK',
  DocumentReleasedToApplicant = 'DOCUMENTS_RELEASED_TO_APPLICANT',
  DiscrepanciesAdvisedByNominatedBank = 'DISCREPANCIES_ADVISED_BY_NOMINATED_BANK',
  DiscrepanciesAdvisedByIssuingBank = 'DISCREPANCIES_ADVISED_BY_ISSUING_BANK',
  DiscrepanciesAcceptedByIssuingBank = 'DISCREPANCIES_ACCEPTED_BY_ISSUING_BANK',
  DiscrepanciesRejectedByIssuingBank = 'DISCREPANCIES_REJECTED_BY_ISSUING_BANK',
  DocumentsAcceptedByApplicant = 'DOCUMENTS_ACCEPTED_BY_APPLICANT',
  DiscrepanciesRejectedByApplicant = 'DISCREPANCIES_REJECTED_BY_APPLICANT'
}

export interface SubmitPresentation {
  comment: string
}

export interface LCPresentationCreateSuccess extends Action {
  type: LCPresentationActionType.CREATE_PRESENTATION_SUCCESS
  payload: ILCPresentation
}

export interface LCAttachVaktDocumentsSuccess extends Action {
  type: LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_SUCCESS
  payload: any
}

export interface LCPresentationFetchSuccess extends Action {
  type: LCPresentationActionType.FETCH_PRESENTATIONS_SUCCESS
  payload: {
    lcReference: string
    presentations: ILCPresentation[]
  }
}

export interface LCPresentationDocumentsFetchSuccess extends Action {
  type: LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS
  payload: Document[]
  presentationId: string
}

export interface LCPresentationVaktDocumentsFetchSuccess extends Action {
  type: LCPresentationActionType.FETCH_VAKT_DOCUMENTS_SUCCESS
  payload: Document[]
  presentationId: string
}

export interface LCPresentationRemoveSuccess extends Action {
  type: LCPresentationActionType.REMOVE_PRESENTATION_SUCCESS
  payload: any
}

export interface LCPresentationCreateError extends Action {
  type: LCPresentationActionType.CREATE_PRESENTATION_FAILURE
  payload: string
}

export interface LCPresentationDeleteDocumentSuccess extends Action {
  type: LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_SUCCESS
  payload: { documentId: string; presentationId: string; lcReference: string }
}

export interface LCPresentationDeleteDocumentError extends Action {
  type: LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_FAILURE
  payload: string
}

export interface LCPresentationUploadDocumentSuccess extends Action {
  type: LCPresentationActionType.UPLOAD_PRESENTATION_DOCUMENT_SUCCESS
  payload: any
}

export interface LCPresentationSubmitSuccess extends Action {
  type: LCPresentationActionType.SUBMIT_PRESENTATION_SUCCESS
  payload: ILCPresentation
}

export interface LCPresentationDocumentsCompliantSuccess extends Action {
  type: LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_SUCCESS
  payload: ILCPresentation
}

export interface LCPresentationDocumentsDiscrepantSuccess extends Action {
  type: LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_SUCCESS
  payload: ILCPresentation
}

export interface LCPresentationRequestWaiverOfDicrepanciesSuccess extends Action {
  type: LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_SUCCESS
  payload: ILCPresentation
}

export type LCPresentationAction =
  | LCPresentationCreateSuccess
  | LCAttachVaktDocumentsSuccess
  | LCPresentationFetchSuccess
  | LCPresentationDocumentsFetchSuccess
  | LCPresentationVaktDocumentsFetchSuccess
  | LCPresentationRemoveSuccess
  | LCPresentationCreateError
  | LCPresentationDeleteDocumentSuccess
  | LCPresentationDeleteDocumentError
  | LCPresentationUploadDocumentSuccess
  | LCPresentationSubmitSuccess
  | LCPresentationDocumentsCompliantSuccess
  | LCPresentationDocumentsDiscrepantSuccess
  | LCPresentationRequestWaiverOfDicrepanciesSuccess
