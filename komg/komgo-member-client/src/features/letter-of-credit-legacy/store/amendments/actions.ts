import { ILCAmendmentBase, ILCAmendmentRejection } from '@komgo/types'
import { ActionCreator } from 'react-redux'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { LetterOfCreditAmendmentActionType } from './types'
import { TradingRole } from '../../../trades/constants'
import { history } from '../../../../store/history'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'
import { HttpRequest } from '../../../../utils/http'
import { ToastContainerIds } from '../../../../utils/toast'
import { LetterOfCreditAmendmentState } from './types'
import { toast } from 'react-toastify'

export type LetterOfCreditAmendmentActionThunk = ThunkAction<Action, LetterOfCreditAmendmentState, HttpRequest>

export const submitLetterOfCreditAmendment: ActionCreator<LetterOfCreditAmendmentActionThunk> = (
  amendment: ILCAmendmentBase,
  lcStaticId: string
) => (dispatch, _, api) => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcStaticId}/amendments`, {
      type: LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_REQUEST,
      onSuccess: {
        type: LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_SUCCESS,
        afterHandler: () => history.push(`/trades?tradingRole=${TradingRole.BUYER}`)
      },
      onError: LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_FAILURE,
      data: amendment
    })
  )
}

export const getLetterOfCreditAmendment: ActionCreator<LetterOfCreditAmendmentActionThunk> = (amendmentId: string) => (
  dispatch,
  _,
  api
) =>
  dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/amendments/${amendmentId}`, {
      type: LetterOfCreditAmendmentActionType.GET_AMENDMENT_REQUEST,
      onSuccess: LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS,
      onError: LetterOfCreditAmendmentActionType.GET_AMENDMENT_FAILURE
    })
  )

export const issueLetterOfCreditAmendmentRequest: ActionCreator<LetterOfCreditAmendmentActionThunk> = (
  amendmentId: string,
  file: File
) => (dispatch, _, api) => {
  const formData = new FormData()
  formData.append('fileData', file)
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/amendments/${amendmentId}/approve`, {
      type: LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_REQUEST,
      onSuccess: {
        type: LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_SUCCESS,
        afterHandler: ({ getState }) => {
          const lcReference = getState()
            .get('lcAmendments')
            .get('byStaticId')
            .toJS()[amendmentId].lcReference
          toast.success(`Amendment request approved for ${lcReference}`, { containerId: ToastContainerIds.Default })
          history.goBack()
        }
      },
      onError: LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_FAILURE,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
  )
}

export const rejectLetterOfCreditAmendmentRequest: ActionCreator<LetterOfCreditAmendmentActionThunk> = (
  amendmentId: string,
  amendmentRejection: ILCAmendmentRejection
) => (dispatch, _, api) =>
  dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/amendments/${amendmentId}/reject`, {
      type: LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_REQUEST,
      onSuccess: {
        type: LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_SUCCESS,
        afterHandler: ({ getState }) => {
          const lcReference = getState()
            .get('lcAmendments')
            .get('byStaticId')
            .toJS()[amendmentId].lcReference
          toast.success(`Amendment request rejected for ${lcReference}`, { containerId: ToastContainerIds.Default })
          history.goBack()
        }
      },
      onError: LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_FAILURE,
      data: amendmentRejection
    })
  )
