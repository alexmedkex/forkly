import { Action } from 'redux'

import { ApiAction } from '../../../../utils/http'

import { HasName, HasId, Product, ProductId, Category } from './index'

type Filter<T, U> = T extends U ? T : never // Remove types from T that are not assignable to U

export interface RequestTemplate extends HasName, HasId {
  id: string
  name: string
  documentTypes: RequestTemplateDocumentType[]
}

export interface RequestTemplateDocumentType {
  product: Product
  category?: Category
  typeId?: string
}

export type CreateRequestTemplateRequest = Filter<RequestTemplate, HasId>

export type CreateRequestTemplateResponse = RequestTemplate

export type UpdateRequestTemplateRequest = RequestTemplate

export type UpdateRequestTemplateResponse = RequestTemplate

export enum RequestTemplateActionType {
  FETCH_REQUEST_TEMPLATE_SUCCESS = '@@docs/FETCH_REQUEST_TEMPLATE_SUCCESS',
  FETCH_REQUEST_TEMPLATE_ERROR = '@@docs/FETCH_REQUEST_TEMPLATE_ERROR',
  CREATE_REQUEST_TEMPLATE_SUCCESS = '@@docs/CREATE_REQUEST_TEMPLATE_SUCCESS',
  CREATE_REQUEST_TEMPLATE_ERROR = '@@docs/CREATE_REQUEST_TEMPLATE_ERROR',
  UPDATE_REQUEST_TEMPLATE_SUCCESS = '@@docs/UPDATE_REQUEST_TEMPLATE_SUCCESS',
  UPDATE_REQUEST_TEMPLATE_ERROR = '@@docs/UPDATE_REQUEST_TEMPLATE_ERROR',
  DELETE_REQUEST_TEMPLATE_SUCCESS = '@@docs/DELETE_REQUEST_TEMPLATE_SUCCESS',
  DELETE_REQUEST_TEMPLATE_ERROR = '@@docs/DELETE_REQUEST_TEMPLATE_ERROR',
  FETCH_REQUEST_TEMPLATE_BY_ID_SUCCESS = '@@docs/FETCH_REQUEST_TEMPLATE_BY_ID_SUCCESS',
  FETCH_REQUEST_TEMPLATE_BY_ID_ERROR = '@@docs/FETCH_REQUEST_TEMPLATE_BY_ID_ERROR'
}

// Actions
export type FetchRequestTemplateAsync = (productId: ProductId) => ApiAction

// GET
export interface FetchRequestTemplateSuccess extends Action {
  payload: RequestTemplate[]
  type: RequestTemplateActionType.FETCH_REQUEST_TEMPLATE_SUCCESS
}

export interface FetchRequestTemplateError extends Action {
  error: Error
  type: RequestTemplateActionType.FETCH_REQUEST_TEMPLATE_ERROR
}

// POST
export type CreateRequestTemplateAsync = (
  RequestTemplateData: CreateRequestTemplateRequest,
  productId: ProductId
) => ApiAction

export interface CreateRequestTemplateSuccess extends Action {
  type: RequestTemplateActionType.CREATE_REQUEST_TEMPLATE_SUCCESS
  payload: CreateRequestTemplateResponse
}

export interface CreateRequestTemplateError extends Action {
  error: Error
  type: RequestTemplateActionType.CREATE_REQUEST_TEMPLATE_ERROR
}

// PATCH
export type UpdateRequestTemplateAsync = (
  updateRequestTemplateRequest: UpdateRequestTemplateRequest,
  productId: ProductId
) => ApiAction

export interface UpdateRequestTemplateSuccess extends Action {
  type: RequestTemplateActionType.UPDATE_REQUEST_TEMPLATE_SUCCESS
  payload: RequestTemplate
}

export interface UpdateRequestTemplateError extends Action {
  error: Error
  type: RequestTemplateActionType.UPDATE_REQUEST_TEMPLATE_ERROR
}

// DELETE
export type DeleteRequestTemplateAsync = (RequestTemplateId: string, productId: ProductId) => ApiAction

export interface DeleteRequestTemplateSuccess extends Action {
  type: RequestTemplateActionType.DELETE_REQUEST_TEMPLATE_SUCCESS
  payload: string
}

export interface DeleteRequestTemplateError extends Action {
  error: Error
  type: RequestTemplateActionType.DELETE_REQUEST_TEMPLATE_ERROR
}

// GET BY ID
export type FetchRequestTemplateByIdAsync = (RequestTemplateId: string, productId: ProductId) => ApiAction

// GET
export interface FetchRequestTemplateByIdSuccess extends Action {
  payload: RequestTemplate
  type: RequestTemplateActionType.FETCH_REQUEST_TEMPLATE_BY_ID_SUCCESS
}

export interface FetchRequestTemplateByIdError extends Action {
  error: Error
  type: RequestTemplateActionType.FETCH_REQUEST_TEMPLATE_BY_ID_ERROR
}

export type RequestTemplateAction =
  | FetchRequestTemplateSuccess
  | FetchRequestTemplateError
  | CreateRequestTemplateSuccess
  | CreateRequestTemplateError
  | UpdateRequestTemplateSuccess
  | UpdateRequestTemplateError
  | DeleteRequestTemplateSuccess
  | DeleteRequestTemplateError
  | FetchRequestTemplateByIdSuccess
  | FetchRequestTemplateByIdError
