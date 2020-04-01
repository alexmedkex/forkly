import { Action } from 'redux'
import { ApiAction } from '../../../../utils/http'
import { BottomSheetItem, BottomSheetStatus } from '../../../bottom-sheet/store/types'
import { Counterparty } from '../../../counterparties/store/types'
import {
  Category,
  DocumentType,
  HasId,
  Product,
  ProductId,
  CounterpartyFilter,
  CounterpartyDocumentFilterWrap,
  Note
} from './index'
import { ReviewStatus } from '../../../review-documents/store/types'

export interface Document extends HasId, BottomSheetItem {
  id: string
  documentId: string
  name: string
  product: Product
  category: Category
  type: DocumentType
  hash: string
  owner: {
    firstName: string
    lastName: string
    companyId: string
  }
  registrationDate: Date
  receivedDate: Date
  metadata: Array<{
    name: string
    value: string
  }>
  content?: {
    signature: string
    data: string
  }
  sharedWith: SharedWith[]
  sharedBy: string
  context?: {
    parcelId?: string
    lcPresentationStaticId?: string
    rdId?: string
    vaktId?: string
  }
  comment?: string
  state: BottomSheetStatus
  uploadInfo?: UploadInfo
  downloadInfo?: DownloadInfo
  sharedInfo?: SharedInfo
}

export interface SharedInfo {
  status: string
  note: string
  reviewerId: string
  receivedDocumentsId: string
  completedReview: boolean
}

export interface UploadInfo {
  uploaderUserId: string
}

export interface DownloadInfo {
  downloadedByUsers: string[]
}

interface KeyValue {
  name: string
  value: string
  state: string
}

// TODO: Pick<>
export interface DocumentCreateRequest {
  name: string
  product: Product
  category: Category
  type: DocumentType
  hash: string
  dateRegistration: Date
  metadata: any
  owner: any
  contents?: any
}

export interface DocumentUpdateRequest {
  id: string
  name: string
  product: Product
  category: Category
  type: DocumentType
  hash: string
  dateRegistration: Date
  metadata: any
  owner: any
  contents: any
}

export interface DocumentResponse extends BottomSheetItem {
  id: string
  documentId: string
  name: string
  product: Product
  category: Category
  type: DocumentType
  hash: string
  owner: {
    firstName: string
    lastName: string
    companyId: string
  }
  receivedDate: Date
  registrationDate: Date
  metadata: Array<{
    name: string
    value: string
  }>
  content?: {
    signature: string
    data: string
  }
  sharedWith: SharedWith[]
  sharedBy: string
  state: BottomSheetStatus // TODO: Make sure enum of document states and LC states are the same. Else BottomSheetStatus -> DocStatus | LCStatus
}

export interface SharedWith {
  counterpartyId: string
  sharedDates: Date[]
}

export interface SharedWithFull {
  counterparty: Counterparty
  lastSharedDate: Date
}

export interface SendDocumentsRequest {
  documents: string[]
  companyId: string
  requestId?: string
  notes?: Note[]
}

export interface RevokedExtSharedDocument {
  extSharedDocumentId: string
  originalDocumentId: string
}

export interface DocumentListFilter {
  type?: string[]
  sharedWith?: string[]
  counterparties?: string[]
}

export interface CounterpartyDocumentFilter {
  type?: string[]
  reviewStatus?: string[]
  reviewedBy?: string[]
}

export enum DocumentActionType {
  START_FETCHING_DOCUMENT_CONTENT = '@@docs/START_FETCHING_DOCUMENT',
  START_FETCHING_DOCUMENTS = '@@docs/START_FETCHING_DOCUMENTS',
  FETCH_DOCUMENT_SUCCESS = '@@docs/FETCH_DOCUMENT_SUCCESS',
  FETCH_DOCUMENT_ERROR = '@@docs/FETCH_DOCUMENT_ERROR',
  FETCH_DOCUMENTS_REQUEST = '@@docs/FETCH_DOCUMENTS_REQUEST',
  FETCH_DOCUMENTS_SUCCESS = '@@docs/FETCH_DOCUMENTS_SUCCESS',
  FETCH_DOCUMENTS_ERROR = '@@docs/FETCH_DOCUMENTS_ERROR',
  FETCH_DOCUMENT_CONTENT_REQUEST = '@@docs/FETCH_DOCUMENT_CONTENT_REQUEST',
  FETCH_DOCUMENT_CONTENT_SUCCESS = '@@docs/FETCH_DOCUMENT_CONTENT_SUCCESS',
  FETCH_DOCUMENT_CONTENT_ERROR = '@@docs/FETCH_DOCUMENT_CONTENT_ERROR',
  SEARCH_DOCUMENTS_START = '@@docs/SEARCH_DOCUMENTS_START',
  SEARCH_DOCUMENTS_SUCCESS = '@@docs/SEARCH_DOCUMENTS_SUCCESS',
  SEARCH_DOCUMENTS_ERROR = '@@docs/SEARCH_DOCUMENTS_ERROR',
  CREATE_DOCUMENT_SUCCESS = '@@docs/CREATE_DOCUMENT_SUCCESS',
  CREATE_DOCUMENT_ERROR = '@@docs/CREATE_DOCUMENT_ERROR',
  SHARE_DOCUMENT_RESULT = '@@docs/SHARE_DOCUMENT_RESULT',
  SEND_DOCUMENTS_SUCCESS = '@@docs/SEND_DOCUMENTS_SUCCESS',
  SEND_DOCUMENTS_ERROR = '@@docs/SEND_DOCUMENTS_ERROR',
  DOWNLOAD_DOCUMENT_SUCCESS = '@@docs/DOWNLOAD_DOCUMENTS_SUCCESS',
  DOWNLOAD_DOCUMENT_ERROR = '@@docs/DOWNLOAD_DOCUMENTS_ERROR',
  SELECT_DOCUMENT = '@@docs/SELECT_DOCUMENT',
  SELECT_DOCUMENT_TYPE = '@@docs/SELECT_DOCUMENT_TYPE',
  BULK_SELECT_DOCUMENTS = '@@docs/BULK_SELECT_DOCUMENTS',
  CHANGE_DOCUMENT_FILTER = '@@docs/CHANGE_DOCUMENT_FILTER',
  SET_DOCUMENT_LIST_FILTER = '@@docs/SET_DOCUMENT_LIST_FILTER',
  SET_COUNTERPARTY_DOCS_FILTER = '@@docs/SET_COUNTERPARTY_DOCS_FILTER',
  DELETE_DOCUMENT_SUCCESS = '@@docs/DELETE_DOCUMENT_SUCCESS',
  DELETE_DOCUMENT_ERROR = '@@docs/DELETE_DOCUMENT_ERROR',
  RESET_DOCUMENTS_SELECT_DATA = '@@docs/RESET_DOCUMENTS_SELECT_DATA',
  RESET_LOADED_DOCUMENT = '@@docs/RESET_LOADED_DOCUMENT',
  SHOW_DOCUMENT_REGISTERED_SUCCESS = '@@docs/SHOW_DOCUMENT_REGISTERED_SUCCESS',
  SHOW_DOCUMENT_REGISTERED_ERROR = '@@docs/SHOW_DOCUMENT_REGISTERED_ERROR',
  SCROLL_TO_DOCUMENT = '@@docs/SCROLL_TO_DOCUMENT',
  SET_COUNTERPARTY_FILTER = '@@docs/SET_COUNTERPARTY_FILTER'
}

export enum FILTERS_NAME {
  COUNTERPARTY = 'selectedCounterparty',
  SEARCH = 'search',
  PARCEL = 'parcel',
  CATEGORY = 'selectedCategoryId',
  SHARED = 'shared'
}

// Actions

// GET
export type FetchDocumentsAsync = (productId: ProductId) => ApiAction

export interface FetchDocumentSuccess extends Action {
  payload: Document
  type: DocumentActionType.FETCH_DOCUMENT_SUCCESS
}

export interface FetchDocumentError extends Action {
  error: Error
  type: DocumentActionType.FETCH_DOCUMENT_ERROR
}

export interface FetchDocumentsSuccess extends Action {
  payload: Document[]
  type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS
}

export interface FetchDocumentsError extends Action {
  error: Error
  type: DocumentActionType.FETCH_DOCUMENTS_ERROR
}

export interface SearchDocumentsStart extends Action {
  type: DocumentActionType.SEARCH_DOCUMENTS_START
}

export interface SearchDocumentsSuccess extends Action {
  payload: Document[]
  type: DocumentActionType.SEARCH_DOCUMENTS_SUCCESS
}

export interface SearchDocumentsError extends Action {
  error: Error
  type: DocumentActionType.SEARCH_DOCUMENTS_ERROR
}

// POST
export type SendDocumentAsync = (sendDocumentsRequest: SendDocumentsRequest[], productId: ProductId) => ApiAction

export interface SendDocumentsSuccess extends Action {
  payload: Document[]
  type: DocumentActionType.SEND_DOCUMENTS_SUCCESS
}

export interface SendDocumentsError extends Action {
  error: Error
  type: DocumentActionType.SEND_DOCUMENTS_ERROR
}

// CREATE

export interface CreateDocumentRequest {
  name: string
  categoryId: string
  documentTypeId: string
  file: File
  creator: UserInfo
  context?: object // In case someone wants to pass in a different context, object defined.
}

export interface UserInfo {
  firstName: string
  lastName: string
  companyId: string
}

export type CreateDocumentAsync = (createDocumentRequest: CreateDocumentRequest, productId: ProductId) => ApiAction

export interface CreateDocumentSuccess extends Action {
  type: DocumentActionType.CREATE_DOCUMENT_SUCCESS
  payload: DocumentResponse
}

export interface CreateDocumentError extends Action {
  error?: Error
  type: DocumentActionType.CREATE_DOCUMENT_ERROR
  payload: BottomSheetItem
}

// PATCH
//

// DELETE
//

export interface DeleteDocumentError extends Action {
  error: Error
  type: DocumentActionType.DELETE_DOCUMENT_ERROR
}

export interface DeleteDocumentSuccess extends Action {
  payload: Document
  type: DocumentActionType.DELETE_DOCUMENT_SUCCESS
}
// GET BY ID
//

// GET
export type DownloadDocumentAsync = (productId: ProductId) => ApiAction

export interface DownloadDocumentSuccess extends Action {
  payload: Document[]
  type: DocumentActionType.DOWNLOAD_DOCUMENT_SUCCESS
}

export interface DownloadDocumentError extends Action {
  error: Error
  type: DocumentActionType.DOWNLOAD_DOCUMENT_ERROR
}

export interface FetchDocumentContentSuccess extends Action {
  payload: Buffer
  type: DocumentActionType.FETCH_DOCUMENT_CONTENT_SUCCESS
  contentType: string
}
export interface FetchDocumentContentError extends Action {
  error: Error
  type: DocumentActionType.FETCH_DOCUMENT_CONTENT_ERROR
}

export interface StartFetchingDocuments extends Action {
  type: DocumentActionType.START_FETCHING_DOCUMENTS
}

export interface StartFetchingDocumentContent extends Action {
  type: DocumentActionType.START_FETCHING_DOCUMENT_CONTENT
}

/*******************************
 * Actions for managing document
 * and document type selections
 ******************************/
export interface SelectDocument extends Action {
  type: DocumentActionType.SELECT_DOCUMENT
  payload: string[]
}

export interface SelectDocumentType extends Action {
  type: DocumentActionType.SELECT_DOCUMENT_TYPE
  payload: string[]
}

export interface BulkSelectDocuments extends Action {
  type: DocumentActionType.BULK_SELECT_DOCUMENTS
  payload: string[]
}

export interface ChangeDocumentsFilter extends Action {
  type: DocumentActionType.CHANGE_DOCUMENT_FILTER
  payload: {
    filter: string
    value: string
  }
}

export interface SetDocumentsListFilter extends Action {
  type: DocumentActionType.SET_DOCUMENT_LIST_FILTER
  payload: DocumentListFilter
}

export interface SetCounterpartyDocsFilter extends Action {
  type: DocumentActionType.SET_COUNTERPARTY_DOCS_FILTER
  payload: CounterpartyDocumentFilterWrap
}

export interface SetCounterpartyFilter extends Action {
  type: DocumentActionType.SET_COUNTERPARTY_FILTER
  payload: CounterpartyFilter
}

export interface ResetDocumentsSelectData extends Action {
  type: DocumentActionType.RESET_DOCUMENTS_SELECT_DATA
}

export interface ResetLoadedDocument extends Action {
  type: DocumentActionType.RESET_LOADED_DOCUMENT
}

export interface DocumentRegisteredSuccess extends Action {
  type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS
  payload: BottomSheetItem
}

export interface DocumentRegisteredError extends Action {
  type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_ERROR
  payload: BottomSheetItem
}

export interface ScrollToDocument {
  type: DocumentActionType.SCROLL_TO_DOCUMENT
  payload: string
}

export type DocumentAction =
  | StartFetchingDocumentContent
  | FetchDocumentSuccess
  | FetchDocumentError
  | FetchDocumentContentSuccess
  | FetchDocumentContentError
  | ResetLoadedDocument

export type DocumentsAction =
  | FetchDocumentsSuccess
  | FetchDocumentsError
  | SearchDocumentsStart
  | SearchDocumentsSuccess
  | SearchDocumentsError
  | CreateDocumentSuccess
  | CreateDocumentError
  | SendDocumentsSuccess
  | SendDocumentsError
  | DownloadDocumentError
  | DownloadDocumentSuccess
  | SelectDocument
  | BulkSelectDocuments
  | SelectDocumentType
  | ChangeDocumentsFilter
  | SetDocumentsListFilter
  | SetCounterpartyDocsFilter
  | StartFetchingDocuments
  | DeleteDocumentError
  | DeleteDocumentSuccess
  | ResetDocumentsSelectData
  | DocumentRegisteredSuccess
  | DocumentRegisteredError
  | ScrollToDocument
  | SetCounterpartyFilter
