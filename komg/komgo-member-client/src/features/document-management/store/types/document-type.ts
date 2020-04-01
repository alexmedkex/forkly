import { Action } from 'redux'

import { ApiAction } from '../../../../utils/http'

import { HasName, HasId, Filter, Product, ProductId, Category } from './index'

export interface DocumentType extends HasName, HasId {
  product: Product
  category: Category
  fields: Field[]
  predefined: boolean
}

export interface Field extends HasId, HasName {
  type: string
  isArray: boolean
}

export type FieldType = 'string' | 'date' | 'number'

export interface DocumentTypeCreateRequest {
  categoryId: string
  name: string
  fields: FieldCreateRequest[]
}

export interface DocumentTypeCreateResponse extends DocumentTypeCreateRequest, HasId {
  productId: string
  categoryId: string
  predefined: boolean
}

export interface DocumentTypeUpdateRequest {
  id: string
  name: string
  categoryId: string
  fields: FieldUpdateRequest[]
}

export type FieldCreateRequest = Filter<Field, HasId>

export type FieldUpdateRequest = FieldCreateRequest

export enum DocumentTypeActionType {
  FETCH_DOCUMENT_TYPES_SUCCESS = '@@docs/FETCH_DOCUMENT_TYPES_SUCCESS',
  FETCH_DOCUMENT_TYPES_ERROR = '@@docs/FETCH_DOCUMENT_TYPES_ERROR',
  CREATE_DOCUMENT_TYPE_SUCCESS = '@@docs/CREATE_DOCUMENT_TYPE_SUCCESS',
  CREATE_DOCUMENT_TYPE_ERROR = '@@docs/CREATE_DOCUMENT_TYPE_ERROR',
  UPDATE_DOCUMENT_TYPE_SUCCESS = '@@docs/UPDATE_DOCUMENT_TYPE_SUCCESS',
  UPDATE_DOCUMENT_TYPE_ERROR = '@@docs/UPDATE_DOCUMENT_TYPE_ERROR',
  DELETE_DOCUMENT_TYPE_SUCCESS = '@@docs/DELETE_DOCUMENT_TYPE_SUCCESS',
  DELETE_DOCUMENT_TYPE_ERROR = '@@docs/DELETE_DOCUMENT_TYPE_ERROR',
  FETCH_DOCUMENT_TYPE_BY_ID_SUCCESS = '@@docs/FETCH_DOCUMENT_TYPE_BY_ID_SUCCESS',
  FETCH_DOCUMENT_TYPE_BY_ID_ERROR = '@@docs/FETCH_DOCUMENT_TYPE_BY_ID_ERROR',
  START_FETCHING_DOCUMENT_TYPES = '@@docs/START_FETCHING_DOCUMENT_TYPES'
}

// Actions

// GET
export type FetchDocumentTypesAsync = (productId: ProductId, categoryId?: string) => ApiAction

export interface FetchDocumentTypesSuccess extends Action {
  payload: DocumentType[]
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_SUCCESS
}

export interface FetchDocumentTypesError extends Action {
  error: Error
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_ERROR
}

export interface StartFetchingDocumentTypes extends Action {
  type: DocumentTypeActionType.START_FETCHING_DOCUMENT_TYPES
  payload: boolean
}

// POST
export type CreateDocumentTypeAsync = (documentTypeData: DocumentTypeCreateRequest, productId: ProductId) => ApiAction

export interface CreateDocumentTypeSuccess extends Action {
  type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_SUCCESS
  payload: DocumentType
}

export interface CreateDocumentTypeError extends Action {
  error: Error
  type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_ERROR
}

// PATCH
export type UpdateDocumentTypeAsync = (
  updateDocumentTypeRequest: DocumentTypeUpdateRequest,
  productId: ProductId
) => ApiAction

export interface UpdateDocumentTypeSuccess extends Action {
  type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_SUCCESS
  payload: DocumentType
}

export interface UpdateDocumentTypeError extends Action {
  error: Error
  type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_ERROR
}

// DELETE
export type DeleteDocumentTypeAsync = (documentTypeId: string, productId: ProductId) => ApiAction

export interface DeleteDocumentTypeSuccess extends Action {
  type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_SUCCESS
}

export interface DeleteDocumentTypeError extends Action {
  error: Error
  type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_ERROR
}

// GET BY ID
export type FetchDocumentTypeByIdAsync = (documentTypeId: string, productId: ProductId) => ApiAction

export interface FetchDocumentTypeByIdSuccess extends Action {
  payload: DocumentType
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPE_BY_ID_SUCCESS
}

export interface FetchDocumentTypeByIdError extends Action {
  error: Error
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPE_BY_ID_ERROR
}

export type DocumentTypeAction =
  | FetchDocumentTypesSuccess
  | FetchDocumentTypesError
  | CreateDocumentTypeSuccess
  | CreateDocumentTypeError
  | UpdateDocumentTypeSuccess
  | UpdateDocumentTypeError
  | DeleteDocumentTypeSuccess
  | DeleteDocumentTypeError
  | FetchDocumentTypeByIdSuccess
  | FetchDocumentTypeByIdError
  | StartFetchingDocumentTypes
