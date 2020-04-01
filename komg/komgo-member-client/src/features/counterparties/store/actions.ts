import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { toast } from 'react-toastify'
import { ApplicationState } from '../../../store/reducers'
import { HttpRequest } from '../../../utils/http'
import { COUNTERPARTIES_ENDPOINT } from '../../../utils/endpoints'
import { ToastContainerIds } from '../../../utils/toast'
import { CounterPartyResponseAction, FetchCounterpartyProfileSuccess } from './types'
import {
  CounterpartiesActionType,
  SearchCounterparty,
  SearchCounterpartyPayload,
  SortConnectedCounterparties,
  Sort,
  SetAddCounterparties,
  SetCounterpartyModal,
  CounterpartyProfile,
  Counterparty
} from './types'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchConnectedCounterpartiesAsync: ActionCreator<ActionThunk> = () => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.get(`${COUNTERPARTIES_ENDPOINT}/counterparties?query={}`, {
      type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      onError: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_FAILURE,
      onSuccess: {
        type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS,
        afterHandler: store => {
          // When all the counterparties are loaded we load their risk profile
          const { dispatch: dispatcher, getState } = store
          const counterpartiesConnected: Counterparty[] = getState()
            .get('counterparties')
            .toJS().counterparties
          counterpartiesConnected.forEach(c => fetchCounterpartyProfileAsync(c.staticId)(dispatcher, getState, api))
        }
      }
    })
  )
}

export const getConnectedCounterpartiesWithRequestsAsync: ActionCreator<ActionThunk> = () => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.get(`${COUNTERPARTIES_ENDPOINT}/counterparties/all?query={}`, {
      type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      onError: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_FAILURE,
      onSuccess: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS
    })
  )
}

export const fetchNotConnectedCompaniesAsync: ActionCreator<ActionThunk> = () => (dispatch, getState, api): Action => {
  return dispatch(
    api.get(`${COUNTERPARTIES_ENDPOINT}/companies/not-covered?query={}`, {
      type: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST,
      onError: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_FAILURE,
      onSuccess: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS
    })
  )
}

export const getCounterpartyRequestAsync: ActionCreator<ActionThunk> = (requestId: string) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.get(`${COUNTERPARTIES_ENDPOINT}/counterparties/requests/${requestId}`, {
      type: CounterpartiesActionType.FETCH_COUNTERPARTY_REQ_REQUEST,
      onError: (errorMessage: string, error: any) =>
        errorHandler(CounterpartiesActionType.FETCH_COUNTERPARTY_REQ_FAILURE, errorMessage, error),
      onSuccess: CounterpartiesActionType.FETCH_COUNTERPARTY_REQ_SUCCESS
    })
  )
}

export const setAddCounterpartyModal: ActionCreator<SetCounterpartyModal> = (isOpen: boolean) => ({
  type: CounterpartiesActionType.SET_COUNTERPARTY_MODAL,
  payload: { name: 'isAddModalOpen', value: isOpen }
})

export const searchCounterparty: ActionCreator<SearchCounterparty> = (payload: SearchCounterpartyPayload) => ({
  type: CounterpartiesActionType.SEARCH_COUNTERPARTY,
  payload
})

export const sortConnectedCounterparties: ActionCreator<SortConnectedCounterparties> = (payload: Sort) => ({
  type: CounterpartiesActionType.SORT_CONNECTED_COUNTERPARTIES,
  payload
})

export const addCounterpartyAsync: ActionCreator<ActionThunk> = (ids: string[]) => (dispatch, getState, api): Action =>
  dispatch(
    api.post(`${COUNTERPARTIES_ENDPOINT}/counterparties/add`, {
      type: CounterpartiesActionType.ADD_COUNTERPARTY_REQUEST,
      data: { companyIds: ids },
      onSuccess: {
        type: CounterpartiesActionType.ADD_COUNTERPARTY_SUCCESS,
        afterHandler: store => {
          toast.success('Connection request sent.', { containerId: ToastContainerIds.Default })
          const { dispatch: dispatcher, getState } = store
          return getConnectedCounterpartiesWithRequestsAsync()(dispatcher, getState, api)
        }
      },
      onError: (errorMessage: string, error: any) =>
        errorHandler(CounterpartiesActionType.ADD_COUNTERPARTY_FAILURE, errorMessage, error)
    })
  )

export const resendCounterpartyAsync: ActionCreator<ActionThunk> = (companyId: string) => (
  dispatch,
  getState,
  api
): Action => {
  dispatch(counterPartyRequestResponseStarted())
  return dispatch(
    api.post(`${COUNTERPARTIES_ENDPOINT}/counterparties/${companyId}/resend`, {
      type: CounterpartiesActionType.RESEND_COUNTERPARTY_REQUEST,
      onError: (errorMessage: string, error: any) =>
        errorHandler(CounterpartiesActionType.RESEND_COUNTERPARTY_FAILURE, errorMessage, error),
      onSuccess: () => {
        dispatch(counterpartySuccessMessage('Counterparty request resent'))
        return { type: CounterpartiesActionType.RESEND_COUNTERPARTY_SUCCESS }
      }
    })
  )
}

export const setAddCounterparties: ActionCreator<SetAddCounterparties> = (payload: string[]) => ({
  type: CounterpartiesActionType.SET_ADD_COUNTERPARTIES,
  payload
})

export const responseOnCounterpartyRequestAsync: ActionCreator<ActionThunk> = (companyId: string, accept: boolean) => (
  dispatch,
  getState,
  api
): Action => {
  dispatch(counterPartyRequestResponseStarted())
  const basicUrl = `${COUNTERPARTIES_ENDPOINT}/counterparties/${companyId}`

  return dispatch(
    api.post(accept ? `${basicUrl}/approve` : `${basicUrl}/reject`, {
      type: CounterpartiesActionType.RESPONSE_ON_COUNTERPARTY_REQ_REQUEST,
      onError: (errorMessage: string, error: any) =>
        errorHandler(CounterpartiesActionType.RESPONSE_ON_COUNTERPARTY_REQ_FAILURE, errorMessage, error),
      onSuccess: () => {
        dispatch(counterpartySuccessMessage(`Connection request ${accept ? 'approved' : 'refused'}`))
        return { type: CounterpartiesActionType.RESPONSE_ON_COUNTERPARTY_REQ_SUCCESS }
      }
    })
  )
}

export const counterPartyRequestResponseStarted: ActionCreator<CounterPartyResponseAction> = () => {
  return {
    type: CounterpartiesActionType.SET_REQUEST_ACTION,
    payload: {
      status: false
    }
  }
}

export const counterpartySuccessMessage: ActionCreator<CounterPartyResponseAction> = (msg: string) => {
  toast.success(msg, { containerId: ToastContainerIds.Default })
  return {
    type: CounterpartiesActionType.SET_REQUEST_ACTION,
    payload: {
      status: true
    }
  }
}

const errorDisplay = (msg: string, error?: any): Action => {
  let errorMessage = msg
  if (error && error.response && error.response.data) {
    errorMessage = error.response.data.error ? error.response.data.error : 'Error occurred'
  }
  toast.error(errorMessage, { containerId: ToastContainerIds.Default })
  return { type: '' }
}

const errorHandler = (type: CounterpartiesActionType, errorMessage: string, error: any) => {
  toast.error(errorMessage, { containerId: ToastContainerIds.Default })
  return {
    type,
    payload: errorMessage,
    status: error.response && error.response.status,
    error: error.response && error.response.data,
    headers: error.response && error.response.headers
  }
}

export const fetchCounterpartyProfileAsync: ActionCreator<ActionThunk> = (counterpartyId: string) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.get(`${COUNTERPARTIES_ENDPOINT}/counterparty-profile/${counterpartyId}`, {
      type: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_REQUEST,
      onSuccess: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_SUCCESS,
      onError: (errorMessage: string, error: any) => ({
        type: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_FAILURE,
        payload: {
          error,
          counterpartyId
        }
      })
    })
  )
}

export const createCounterpartyProfileAsync: ActionCreator<ActionThunk> = (
  createCPProfileRequest: CounterpartyProfile
) => (dispatch, getState, api): Action => {
  return dispatch(
    api.post(`${COUNTERPARTIES_ENDPOINT}/counterparty-profile`, {
      type: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_REQUEST,
      data: createCPProfileRequest,
      onSuccess: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_SUCCESS,
      onError: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_FAILURE
    })
  )
}

export const updateCounterpartyProfileAsync: ActionCreator<ActionThunk> = (
  updateCPProfileRequest: CounterpartyProfile
) => (dispatch, getState, api): Action => {
  const { counterpartyId, ...updateFields } = updateCPProfileRequest
  return dispatch(
    api.patch(`${COUNTERPARTIES_ENDPOINT}/counterparty-profile/${counterpartyId}`, {
      type: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_REQUEST,
      data: updateFields,
      onSuccess: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_SUCCESS,
      onError: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_FAILURE
    })
  )
}
