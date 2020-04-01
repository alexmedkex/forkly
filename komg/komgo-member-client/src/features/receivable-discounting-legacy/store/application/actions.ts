import { IReceivablesDiscountingBase, IReceivablesDiscountingInfo } from '@komgo/types'
import { compressToEncodedURIComponent } from 'lz-string'
import { Action, ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { history } from '../../../../store/history'
import { ApplicationState } from '../../../../store/reducers'
import { RECEIVABLE_DISCOUNTING_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { HttpRequest } from '../../../../utils/http'
import { ReceivableDiscountingApplicationActionType } from './types'
import { IFetchMultipleReceivableDiscountFilter } from '../types'
import { ActionCreatorChainHandler } from '../../../../store/common/types'

export type ReceivableDiscountingActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchDiscountingRequest: ActionCreator<ReceivableDiscountingActionThunk> = (
  rdId: string,
  chainHandler?: ActionCreatorChainHandler<IReceivablesDiscountingInfo>
) => (dispatch, _, api): Action =>
  dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/info/rd/${rdId}`, {
      type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST,
      onSuccess: (payload: IReceivablesDiscountingInfo) => ({
        type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS,
        payload,
        afterHandler: store => {
          return chainHandler && chainHandler(store, payload)
        }
      }),
      onError: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_FAILURE
    })
  )

export const createReceivablesDiscountingApplication: ActionCreator<ReceivableDiscountingActionThunk> = (
  values: IReceivablesDiscountingBase
) => (dispatch, _, api): Action =>
  dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/rd`, {
      type: ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_REQUEST,
      data: values,
      onSuccess: responseData => ({
        type: ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_SUCCESS,
        afterHandler: () => history.push(`/receivable-discounting/${responseData.staticId}/request-for-proposal`)
      }),
      onError: ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE
    })
  )

export const updateReceivablesDiscountingApplication: ActionCreator<ReceivableDiscountingActionThunk> = (
  data: IReceivablesDiscountingBase,
  rdId: string,
  replace: boolean = false
) => (dispatch, _, api): Action =>
  dispatch(
    api.put(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/rd/${rdId}?replace=${replace}`, {
      type: ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST,
      onError: ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_FAILURE,
      onSuccess: {
        afterHandler: store => {
          fetchHistoryForRDData(rdId)(store.dispatch, _ as any, api)
          replace
            ? history.push(`/receivable-discounting/${rdId}/request-for-proposal`)
            : shareReceivablesDiscountingRequest(rdId)(store.dispatch, _ as any, api)
        },
        type: ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_SUCCESS,
        rdId
      },
      data
    })
  )

const shareReceivablesDiscountingRequest: ActionCreator<ReceivableDiscountingActionThunk> = (rdId: string) => (
  dispatch,
  _,
  api
): Action =>
  dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/rd/${rdId}/share`, {
      type: ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_REQUEST,
      onError: ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_FAILURE,
      onSuccess: ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_SUCCESS
    })
  )

export const fetchRdsByStaticIds: ActionCreator<ReceivableDiscountingActionThunk> = (
  filter?: IFetchMultipleReceivableDiscountFilter,
  polling: boolean = false
) => (dispatch, _, api): Action => {
  let params = { polling } as any
  if (filter) {
    params = { ...params, filter: compressToEncodedURIComponent(JSON.stringify(filter)) }
  }
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/info/rd`, {
      type: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST,
      onSuccess: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS,
      onError: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_FAILURE,
      params
    })
  )
}

export const fetchHistoryForRDData: ActionCreator<ReceivableDiscountingActionThunk> = (rdId: string) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/rd/${rdId}/history`, {
      type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_REQUEST,
      onSuccess: {
        type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS,
        rdId
      },
      onError: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_FAILURE
    })
  )
}
