import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { toast } from 'react-toastify'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { ToastContainerIds } from '../../../../utils/toast'

import {
  RequestActionType,
  FetchRequestSuccess,
  FetchRequestError,
  Request,
  CreateRequestResponse,
  CreateRequestSuccess,
  CreateRequestError,
  CreateRequestRequest,
  FetchRequestByIdSuccess,
  FetchRequestByIdError,
  FetchIncomingRequestSuccess,
  FetchIncomingRequestError,
  FetchIncomingRequestByIdError,
  FetchIncomingRequestByIdSuccess,
  ProductId
} from '../types'
import { displayToast, TOAST_TYPE } from '../../../../features/toasts/utils'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

// GET OUTGOING
export const fetchRequestsAsync: ActionCreator<ActionThunk> = (productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/outgoing-requests`, {
        onError: fetchRequestsError,
        onSuccess: fetchRequestsSuccess
      })
    )
  }
}

export const fetchRequestsSuccess: ActionCreator<FetchRequestSuccess> = (request: CreateRequestResponse[]) => ({
  type: RequestActionType.FETCH_REQUEST_SUCCESS,
  payload: request
})

export const fetchRequestsError: ActionCreator<FetchRequestError> = error => ({
  type: RequestActionType.FETCH_REQUEST_ERROR,
  error
})

// GET INCOMING
export const fetchIncomingRequestAsync: ActionCreator<ActionThunk> = (productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/incoming-requests`, {
        type: RequestActionType.FETCH_INCOMING_REQ_REQUEST,
        onError: fetchIncomingRequestError,
        onSuccess: fetchIncomingRequestSuccess
      })
    )
  }
}

export const fetchIncomingRequestSuccess: ActionCreator<FetchIncomingRequestSuccess> = (
  incomingRequests: Request[]
) => ({
  type: RequestActionType.FETCH_INCOMING_REQ_SUCCESS,
  payload: incomingRequests
})

export const fetchIncomingRequestError: ActionCreator<FetchIncomingRequestError> = error => ({
  type: RequestActionType.FETCH_INCOMING_REQ_FAILURE,
  error
})

export const fetchIncomingRequestbyIdAsync: ActionCreator<ActionThunk> = (productId: ProductId, requestId: string) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/incoming-requests/${requestId}`, {
        type: RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_REQUEST,
        onError: fetchIncomingRequestByIdError,
        onSuccess: fetchIncomingRequestByIdSuccess
      })
    )
  }
}

export const fetchIncomingRequestByIdSuccess: ActionCreator<FetchIncomingRequestByIdSuccess> = (request: Request) => ({
  type: RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_SUCCESS,
  payload: request
})

export const fetchIncomingRequestByIdError: ActionCreator<FetchIncomingRequestByIdError> = error => ({
  type: RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_ERROR,
  error
})

// POST
export const createRequestAsync: ActionCreator<ActionThunk> = (
  requestRequest: CreateRequestRequest,
  productId: ProductId
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/outgoing-requests`, {
        data: requestRequest,
        onError: createRequestError,
        onSuccess: createRequestSuccess
      })
    )
  }
}

export const createRequestSuccess: ActionCreator<CreateRequestSuccess> = (request: Request) => {
  displayToast('Document request sent', TOAST_TYPE.Ok)
  return {
    type: RequestActionType.CREATE_REQUEST_SUCCESS,
    payload: request
  }
}

export const createRequestError: ActionCreator<CreateRequestError> = error => {
  displayToast('Failed to send document request. Please try again', TOAST_TYPE.Error)
  return {
    type: RequestActionType.CREATE_REQUEST_ERROR,
    error
  }
}

// GET BY ID
export const fetchRequestbyIdAsync: ActionCreator<ActionThunk> = (requestId: string, productId: ProductId) => {
  return (dispatch, _, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/outgoing-requests/${requestId}`, {
        type: RequestActionType.FETCH_REQUEST_BY_ID_REQUEST,
        onError: fetchRequestByIdError,
        onSuccess: fetchRequestByIdSuccess
      })
    )
  }
}

export const fetchRequestByIdSuccess: ActionCreator<FetchRequestByIdSuccess> = (request: Request) => {
  return {
    type: RequestActionType.FETCH_REQUEST_BY_ID_SUCCESS,
    payload: request
  }
}

export const fetchRequestByIdError: ActionCreator<FetchRequestByIdError> = error => ({
  type: RequestActionType.FETCH_REQUEST_BY_ID_ERROR,
  error
})
