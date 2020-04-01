import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../../utils/endpoints'

import {
  TemplateActionType,
  FetchTemplateSuccess,
  FetchTemplateError,
  Template,
  CreateTemplateResponse,
  CreateTemplateSuccess,
  CreateTemplateError,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  UpdateTemplateResponse,
  UpdateTemplateSuccess,
  UpdateTemplateError,
  DeleteTemplateSuccess,
  DeleteTemplateError,
  FetchTemplateByIdSuccess,
  FetchTemplateByIdError,
  ProductId
} from '../types'
import { DEFAULT_PRODUCT } from '../../../document-management/store'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

// GET
export const fetchTemplatesAsync: ActionCreator<ActionThunk> = (productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/templates`, {
        onError: fetchTemplatesError,
        onSuccess: fetchTemplatesSuccess
      })
    )
  }
}

export const fetchTemplatesSuccess: ActionCreator<FetchTemplateSuccess> = (template: CreateTemplateResponse[]) => ({
  type: TemplateActionType.FETCH_TEMPLATE_SUCCESS,
  payload: template
})

export const fetchTemplatesError: ActionCreator<FetchTemplateError> = error => ({
  type: TemplateActionType.FETCH_TEMPLATE_ERROR,
  error
})

// POST
export const createTemplateAsync: ActionCreator<ActionThunk> = (
  templateRequest: CreateTemplateRequest,
  productId: ProductId
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/templates/`, {
        data: templateRequest,
        onError: createTemplateError,
        onSuccess: createTemplateSuccess
      })
    )
  }
}

export const createTemplateSuccess: ActionCreator<CreateTemplateSuccess> = (template: Template) => ({
  type: TemplateActionType.CREATE_TEMPLATE_SUCCESS,
  payload: template
})

export const createTemplateError: ActionCreator<CreateTemplateError> = error => ({
  type: TemplateActionType.CREATE_TEMPLATE_ERROR,
  error
})

// PATCH
export const updateTemplateAsync: ActionCreator<ActionThunk> = (
  templateRequest: UpdateTemplateRequest,
  productId: ProductId
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/templates/`, {
        data: templateRequest,
        onError: updateTemplateError,
        onSuccess: updateTemplateSuccess
      })
    )
  }
}

export const updateTemplateSuccess: ActionCreator<UpdateTemplateSuccess> = (template: UpdateTemplateResponse) => ({
  type: TemplateActionType.UPDATE_TEMPLATE_SUCCESS,
  payload: template
})

export const updateTemplateError: ActionCreator<UpdateTemplateError> = error => ({
  type: TemplateActionType.UPDATE_TEMPLATE_ERROR,
  error
})

// DELETE
export const deleteTemplateAsync: ActionCreator<ActionThunk> = (templateId: string, productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.delete(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/templates/${templateId}`, {
        onError: deleteTemplateError,
        onSuccess: deleteTemplateSuccess
      })
    )
  }
}

export const deleteTemplateSuccess: ActionCreator<DeleteTemplateSuccess> = (templateId: string) => ({
  type: TemplateActionType.DELETE_TEMPLATE_SUCCESS,
  payload: templateId
})

export const deleteTemplateError: ActionCreator<DeleteTemplateError> = error => ({
  type: TemplateActionType.DELETE_TEMPLATE_ERROR,
  error
})

// GET BY ID
export const fetchTemplatebyIdAsync: ActionCreator<ActionThunk> = (templateId: string, productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/templates/${templateId}`, {
        onError: fetchTemplateByIdError,
        onSuccess: fetchTemplateByIdSuccess
      })
    )
  }
}

export const fetchTemplateByIdSuccess: ActionCreator<FetchTemplateByIdSuccess> = (template: Template) => ({
  type: TemplateActionType.FETCH_TEMPLATE_BY_ID_SUCCESS,
  payload: template
})

export const fetchTemplateByIdError: ActionCreator<FetchTemplateByIdError> = error => ({
  type: TemplateActionType.FETCH_TEMPLATE_BY_ID_ERROR,
  error
})
