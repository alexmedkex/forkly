// Action types
import { Action } from 'redux'
import { ApiAction } from '../../../utils/http'
import { ImmutableMap } from '../../../utils/types'

export enum ActionType {
  FETCH_DOCUMENTS_RECEIVED_SUCCESS = '@@reviewDocs/FETCH_DOCUMENTS_RECEIVED_SUCCESS',
  FETCH_DOCUMENTS_RECEIVED_ERROR = '@@reviewDocs/FETCH_DOCUMENTS_RECEIVED_ERROR',
  FETCH_DOCUMENT_CONTENT_SUCCESS = '@@reviewDocs/FETCH_DOCUMENT_CONTENT_SUCCESS',
  FETCH_DOCUMENT_CONTENT_ERROR = '@@reviewDocs/FETCH_DOCUMENT_CONTENT_ERROR',
  POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS = '@@reviewDocs/POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS',
  POST_COMPLETE_DOCUMENTS_REVIEW_ERROR = '@@reviewDocs/POST_COMPLETE_DOCUMENTS_REVIEW_ERROR',
  PATCH_DOCUMENTS_REVIEW_SUCCESS = '@@reviewDocs/PATCH_DOCUMENTS_REVIEW_SUCCESS',
  PATCH_DOCUMENTS_REVIEW_ERROR = '@@reviewDocs/PATCH_DOCUMENTS_REVIEW_ERROR',
  FETCH_SUBMITTED_DOCUMENTS_REQUEST = '@@reviewDocs/FETCH_SUBMITTED_DOCUMENTS_REQUEST',
  FETCH_SUBMITTED_DOCUMENTS_SUCCESS = '@@reviewDocs/FETCH_SUBMITTED_DOCUMENTS_SUCCESS',
  FETCH_SUBMITTED_DOCUMENTS_FAILURE = '@@reviewDocs/FETCH_SUBMITTED_DOCUMENTS_FAILURE'
}

// State
export interface ReviewDocumentsStateFields {
  documentsReview: IFullDocumentReviewResponse[]
  requestId: string
  companyId: string
  reviewCompleted: boolean
}

export type ReviewDocumentsState = ImmutableMap<ReviewDocumentsStateFields>

// Actions DocumentsReceived

export type ReviewDocumentsAction =
  | FetchDocumentsReceivedError
  | FetchDocumentsReceivedSuccess
  | FetchContentDocumentError
  | FetchContentDocumentSuccess
  | PostCompleteDocumentsReviewSuccess
  | PostCompleteDocumentsReviewError
  | PatchDocumentsReviewError
  | PatchDocumentsReviewSuccess
  | FetchDocumentsSubmitted

export type FetchDocumentsReceivedAsync = () => ApiAction

export interface FetchDocumentsReceivedError extends Action {
  error: Error
  type: ActionType.FETCH_DOCUMENTS_RECEIVED_ERROR
}

export interface FetchDocumentsReceivedSuccess extends Action {
  payload: IFullReceivedDocumentsResponse
  type: ActionType.FETCH_DOCUMENTS_RECEIVED_SUCCESS
}

export interface FetchDocumentsSubmitted {
  type: ActionType.FETCH_SUBMITTED_DOCUMENTS_SUCCESS
  payload: IFullSubmittedDocumentsResponse
}

// Actions DocumentContent

export type FetchContentDocumentAsync = () => ApiAction

export interface FetchContentDocumentError extends Action {
  error: Error
  type: ActionType.FETCH_DOCUMENT_CONTENT_ERROR
}

export interface FetchContentDocumentSuccess extends Action {
  payload: Buffer
  type: ActionType.FETCH_DOCUMENT_CONTENT_SUCCESS
  contentType: string
}

// Actions PostDocumentsReview

export type PostCompleteDocumentsReviewAsync = () => ApiAction

export interface PostCompleteDocumentsReviewError extends Action {
  error: Error
  type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_ERROR
}

export interface PostCompleteDocumentsReviewSuccess extends Action {
  type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS
}

// Actions update review for document

export type PatchDocumentsReviewAsync = () => ApiAction

export interface PatchDocumentsReviewError extends Action {
  error: Error
  type: ActionType.PATCH_DOCUMENTS_REVIEW_ERROR
}

export interface PatchDocumentsReviewSuccess extends Action {
  type: ActionType.PATCH_DOCUMENTS_REVIEW_SUCCESS
  payload: UpdateStatus
}

// Enum for states of a document evaluation: ['pending', 'accepted', 'rejected']

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

// Update documents

export interface UpdateStatus {
  id: string
  productId: string
  companyId: string
  requestId: string
  documents: DocumentReview[]
}

export interface DocumentReview {
  documentId: string
  status: string
  note: string
}

// DocumentsReceived types

export interface IFullReceivedDocumentsResponse {
  id: string
  product: IProductResponse
  companyId: string
  request?: IFullOutgoingRequestResponse
  documents: IFullDocumentReviewResponse[]
  feedbackSent: boolean
}

export interface IFullSubmittedDocumentsResponse {
  companyId: string
  documents: IFullDocumentReviewResponse[]
  feedbackReceived: boolean
}

export interface IFullDocumentReviewResponse {
  document: IFullDocumentRegisterResponse
  status: string
  note: string
}

export interface IFullDocumentRegisterResponse {
  id: string
  name: string
  product: IProductResponse
  category: IFullCategoryResponse
  type: IFullTypeResponse
  owner: IOwnerResponse
  hash: string
  sharedWith: ISharedWith[]
  receivedDate: Date
  registrationDate: Date
  metadata: KeyValueRequest[]
  sharedBy: string
  context?: any
  comment?: string
}

export interface ISharedWith {
  counterpartyId: string
  sharedDates: Date[]
}

export class KeyValueRequest {
  name: string
  value: string
}

export interface IOwnerResponse {
  firstName: string
  lastName: string
  companyId: string
}

export interface IProductResponse {
  id: string
  name: string
}

export interface IFullOutgoingRequestResponse {
  id: string
  product: IProductResponse
  companyId: string
  types: IFullTypeResponse[]
}

export interface IProductResponse {
  id: string
  name: string
}

export interface IFullTypeResponse {
  id: string
  product: IProductResponse
  category: IFullCategoryResponse
  name: string
  fields: ITypeFieldResponse[]
  predefined: boolean
}

export enum FieldType {
  STRING = 'string',
  DATE = 'date',
  NUMBER = 'number'
}

export interface ITypeFieldResponse {
  id: string
  name: string
  type: FieldType
  isArray: boolean
}

export interface IProductResponse {
  id: string
  name: string
}

export interface IFullCategoryResponse {
  id: string
  product: IProductResponse
  name: string
}

export interface IProductResponse {
  id: string
  name: string
}

export enum IDocumentReviewStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PENDING = 'pending'
}
