import { Action } from 'redux'

import { ApiAction } from '../../../../utils/http'

import { HasName, HasId, Product, ProductId, DocumentType, Filter } from './index'
import { Field } from './document-type'
import { Document } from './document'

export interface Request extends HasName, HasId {
  product: Product
  types: DocumentType[]
  companyId: string
  documents: Document[]
  sentDocuments: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
  deadline?: string | Date
  notes: Note[]
}

export interface RequestCustomType extends HasId, HasName {
  fields: Field[]
}

export interface CreateRequestRequest {
  companyId: string
  types: string[]
  context: {}
  notes: Array<Note | null>
}

export interface Note {
  content: string
  date: string
  sender: string
}

export type CreateRequestResponse = Request

export type UpdateRequestRequest = Request

export type UpdateRequestResponse = Request

export enum RequestActionType {
  FETCH_REQUEST_SUCCESS = '@@docs/FETCH_REQUEST_SUCCESS',
  FETCH_REQUEST_ERROR = '@@docs/FETCH_REQUEST_ERROR',
  CREATE_REQUEST_SUCCESS = '@@docs/CREATE_REQUEST_SUCCESS',
  CREATE_REQUEST_RESULT = '@@docs/CREATE_REQUEST_RESULT',
  CREATE_REQUEST_ERROR = '@@docs/CREATE_REQUEST_ERROR',
  FETCH_REQUEST_BY_ID_REQUEST = '@@docs/FETCH_REQ_BY_ID_REQUEST',
  FETCH_REQUEST_BY_ID_SUCCESS = '@@docs/FETCH_REQ_BY_ID_SUCCESS',
  FETCH_REQUEST_BY_ID_ERROR = '@@docs/FETCH_REQ_BY_ID_ERROR',
  FETCH_INCOMING_REQ_SUCCESS = '@@docs/FETCH_INCOMING_REQ_SUCCESS',
  FETCH_INCOMING_REQ_FAILURE = '@@docs/FETCH_INCOMING_REQ_FAILURE',
  FETCH_INCOMING_REQ_REQUEST = '@@docs/FETCH_INCOMING_REQ_REQUEST',
  FETCH_INCOMING_REQUEST_BY_ID_SUCCESS = '@@docs/FETCH_INCOMING_REQ_BY_ID_SUCCESS',
  FETCH_INCOMING_REQUEST_BY_ID_ERROR = '@@docs/FETCH_INCOMING_REQ_BY_ID_ERROR',
  FETCH_INCOMING_REQUEST_BY_ID_REQUEST = '@@docs/FETCH_INCOMING_REQ_BY_ID_REQUEST'
}

// Actions
export type FetchRequestAsync = (productId: ProductId) => ApiAction

// GET
export interface FetchRequestSuccess extends Action {
  payload: Request[]
  type: RequestActionType.FETCH_REQUEST_SUCCESS
}

export interface FetchRequestError extends Action {
  error: Error
  type: RequestActionType.FETCH_REQUEST_ERROR
}

// POST
export type CreateRequestAsync = (requestData: CreateRequestRequest, productId: ProductId) => ApiAction

export interface CreateRequestSuccess extends Action {
  type: RequestActionType.CREATE_REQUEST_SUCCESS
  payload: CreateRequestResponse
}

export interface CreateRequestError extends Action {
  error: Error
  type: RequestActionType.CREATE_REQUEST_ERROR
}

// GET BY ID
export type FetchRequestByIdAsync = (requestId: string, productId: ProductId) => ApiAction

// GET
export interface FetchRequestByIdSuccess extends Action {
  payload: Request
  type: RequestActionType.FETCH_REQUEST_BY_ID_SUCCESS
}

export interface FetchRequestByIdError extends Action {
  error: Error
  type: RequestActionType.FETCH_REQUEST_BY_ID_ERROR
}

export interface FetchIncomingRequestSuccess extends Action {
  payload: Request[]
  type: RequestActionType.FETCH_INCOMING_REQ_SUCCESS
}

export interface FetchIncomingRequestError extends Action {
  error: Error
  type: RequestActionType.FETCH_INCOMING_REQ_FAILURE
}

export interface FetchIncomingRequests extends Action {
  type: RequestActionType.FETCH_INCOMING_REQ_REQUEST
  payload: boolean
}

export interface FetchIncomingRequestByIdSuccess extends Action {
  payload: Request
  type: RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_SUCCESS
}

export interface FetchIncomingRequestByIdError extends Action {
  error: Error
  type: RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_ERROR
}

export type RequestAction =
  | FetchRequestSuccess
  | FetchRequestError
  | CreateRequestSuccess
  | CreateRequestError
  | FetchRequestByIdSuccess
  | FetchRequestByIdError
  | FetchIncomingRequestSuccess
  | FetchIncomingRequestError
  | FetchIncomingRequests
  | FetchIncomingRequestByIdSuccess
  | FetchIncomingRequestByIdError
