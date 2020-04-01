import { Action } from 'redux'

import { ApiAction } from '../../../../utils/http'

import { HasName, HasId, Filter, DocumentType, Product, ProductId } from './index'

export interface Template extends HasName, HasId {
  product: Product
  predefined: boolean
  types: DocumentType[]
  metadata: TemplateMetadata[]
}

export interface TemplateMetadata extends HasName {
  value: string
}

export type CreateTemplateRequest = Filter<Template, HasId>

export type CreateTemplateResponse = Template

export type UpdateTemplateRequest = Template

export type UpdateTemplateResponse = Template

export enum TemplateActionType {
  FETCH_TEMPLATE_SUCCESS = '@@docs/FETCH_TEMPLATE_SUCCESS',
  FETCH_TEMPLATE_ERROR = '@@docs/FETCH_TEMPLATE_ERROR',
  CREATE_TEMPLATE_SUCCESS = '@@docs/CREATE_TEMPLATE_SUCCESS',
  CREATE_TEMPLATE_ERROR = '@@docs/CREATE_TEMPLATE_ERROR',
  UPDATE_TEMPLATE_SUCCESS = '@@docs/UPDATE_TEMPLATE_SUCCESS',
  UPDATE_TEMPLATE_ERROR = '@@docs/UPDATE_TEMPLATE_ERROR',
  DELETE_TEMPLATE_SUCCESS = '@@docs/DELETE_TEMPLATE_SUCCESS',
  DELETE_TEMPLATE_ERROR = '@@docs/DELETE_TEMPLATE_ERROR',
  FETCH_TEMPLATE_BY_ID_SUCCESS = '@@docs/FETCH_TEMPLATE_BY_ID_SUCCESS',
  FETCH_TEMPLATE_BY_ID_ERROR = '@@docs/FETCH_TEMPLATE_BY_ID_ERROR'
}

// Actions
export type FetchTemplateAsync = (productId: ProductId) => ApiAction

// GET
export interface FetchTemplateSuccess extends Action {
  payload: Template[]
  type: TemplateActionType.FETCH_TEMPLATE_SUCCESS
}

export interface FetchTemplateError extends Action {
  error: Error
  type: TemplateActionType.FETCH_TEMPLATE_ERROR
}

// POST
export type CreateTemplateAsync = (templateData: CreateTemplateRequest, productId: ProductId) => ApiAction

export interface CreateTemplateSuccess extends Action {
  type: TemplateActionType.CREATE_TEMPLATE_SUCCESS
  payload: CreateTemplateResponse
}

export interface CreateTemplateError extends Action {
  error: Error
  type: TemplateActionType.CREATE_TEMPLATE_ERROR
}

// PATCH
export type UpdateTemplateAsync = (updateTemplateRequest: UpdateTemplateRequest, productId: ProductId) => ApiAction

export interface UpdateTemplateSuccess extends Action {
  type: TemplateActionType.UPDATE_TEMPLATE_SUCCESS
  payload: Template
}

export interface UpdateTemplateError extends Action {
  error: Error
  type: TemplateActionType.UPDATE_TEMPLATE_ERROR
}

// DELETE
export type DeleteTemplateAsync = (templateId: string, productId: ProductId) => ApiAction

export interface DeleteTemplateSuccess extends Action {
  type: TemplateActionType.DELETE_TEMPLATE_SUCCESS
  payload: string
}

export interface DeleteTemplateError extends Action {
  error: Error
  type: TemplateActionType.DELETE_TEMPLATE_ERROR
}

// GET BY ID
export type FetchTemplateByIdAsync = (templateId: string, productId: ProductId) => ApiAction

// GET
export interface FetchTemplateByIdSuccess extends Action {
  payload: Template
  type: TemplateActionType.FETCH_TEMPLATE_BY_ID_SUCCESS
}

export interface FetchTemplateByIdError extends Action {
  error: Error
  type: TemplateActionType.FETCH_TEMPLATE_BY_ID_ERROR
}

export type TemplateAction =
  | FetchTemplateSuccess
  | FetchTemplateError
  | CreateTemplateSuccess
  | CreateTemplateError
  | UpdateTemplateSuccess
  | UpdateTemplateError
  | DeleteTemplateSuccess
  | DeleteTemplateError
  | FetchTemplateByIdSuccess
  | FetchTemplateByIdError
