import { ActionCreator } from 'react-redux'
import { Action } from 'redux'
import { ActionWithAfterHandler, ServerError } from '../store/common/types'

export enum ApiActionType {
  API_REQUEST = '@@http/API_REQUEST'
}

export const CALL_API = Symbol('CALL_API')

export enum Method {
  GET = 'Get',
  POST = 'Post',
  PUT = 'Put',
  DELETE = 'Delete',
  PATCH = 'PATCH'
}
export interface ApiAction {
  type: string
  CALL_API?: symbol
  headers?: {}
  meta?: Meta
  status?: number
  payload?: {}
  // LS Not sure if add here or not
  error?: ServerError
}

type OnSuccessType = Action | ActionCreator<Action> | ActionWithAfterHandler | string

type OnErrorType = string | Action | ActionCreator<Action> | ActionWithAfterHandler

export type Request = (url: string, config: RequestConfig) => ApiAction

interface Meta {
  method: Method
  url: string
  onSuccess: OnSuccessType
  onError: OnErrorType
  params?: any
  responseType?: string
  noAuth?: boolean // set to true if Authorization header is not needed
}

interface RequestConfig {
  data?: {}
  params?: {}
  responseType?: string
  onSuccess?: OnSuccessType
  onError: OnErrorType
  headers?: {}
  type?: string
  noAuth?: boolean
}

export interface HttpRequest {
  get: Request
  post: Request
  patch: Request
  put: Request
  delete: Request
}

class Http implements HttpRequest {
  get: Request = (url: string, config: RequestConfig) => ({
    type: config.type || ApiActionType.API_REQUEST,
    CALL_API,
    headers: config.headers || {},
    payload: config.data || '',
    meta: {
      method: Method.GET,
      url,
      params: config.params,
      responseType: config.responseType || 'json',
      onSuccess: config.onSuccess,
      onError: config.onError,
      noAuth: config.noAuth
    }
  })

  post: Request = (url: string, config: RequestConfig) => ({
    type: config.type || ApiActionType.API_REQUEST,
    CALL_API,
    headers: config.headers || {},
    payload: config.data,
    meta: {
      method: Method.POST,
      url,
      params: config.params,
      onSuccess: config.onSuccess,
      onError: config.onError,
      noAuth: config.noAuth,
      responseType: config.responseType || 'json'
    }
  })

  patch: Request = (url: string, config: RequestConfig) => ({
    type: config.type || ApiActionType.API_REQUEST,
    CALL_API,
    headers: config.headers || {},
    payload: config.data,
    meta: {
      method: Method.PATCH,
      url,
      params: config.params,
      onSuccess: config.onSuccess,
      onError: config.onError,
      noAuth: config.noAuth
    }
  })

  put: Request = (url: string, config: RequestConfig) => ({
    type: config.type || ApiActionType.API_REQUEST,
    CALL_API,
    headers: config.headers || {},
    payload: config.data,
    meta: {
      method: Method.PUT,
      url,
      params: config.params,
      onSuccess: config.onSuccess,
      onError: config.onError,
      noAuth: config.noAuth
    }
  })

  delete: Request = (url: string, config: RequestConfig) => ({
    type: config.type || ApiActionType.API_REQUEST,
    CALL_API,
    headers: config.headers || {},
    meta: {
      method: Method.DELETE,
      url,
      params: config.params,
      onSuccess: config.onSuccess,
      onError: config.onError,
      noAuth: config.noAuth
    }
  })
}

const httpInstance = new Http()

export default httpInstance
