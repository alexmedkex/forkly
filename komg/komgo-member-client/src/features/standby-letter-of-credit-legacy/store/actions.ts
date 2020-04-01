import { Action, ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { IStandbyLetterOfCreditBase, IStandbyLetterOfCredit } from '@komgo/types'
import { compressToBase64 } from 'lz-string'
import { stringify } from 'qs'

import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../utils/endpoints'
import { StandbyLetterOfCreditActionType, FetchStandByLettersOfCredit } from './types'

import { HttpRequest } from '../../../utils/http'
import { ApplicationState } from '../../../store/reducers'
import { DocumentActionType } from '../../document-management'
import { fetchTradesWithCargos } from '../../trades/store/actions'
import { goBackOrFallBackTo } from '../utils/goBackOrFallback'

const SBLC_DASHBOARD_URL = '/financial-instruments?tab=Standby%20Letters%20of%20Credit'

export type StandbyLetterOfCreditActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const submitStandbyLetterOfCredit: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  standbyLetterOfCreditBase: IStandbyLetterOfCreditBase
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit`, {
      type: StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => goBackOrFallBackTo({ fallbackURL: SBLC_DASHBOARD_URL })
      },
      onError: StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_FAILURE,
      data: standbyLetterOfCreditBase
    })
  )
}

export const getStandbyLetterOfCredit: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  standbyLetterOfCreditId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit/${standbyLetterOfCreditId}`, {
      type: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_REQUEST,
      onSuccess: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS,
      onError: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_FAILURE
    })
  )
}

export const fetchStandByLettersOfCredit: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  params: FetchStandByLettersOfCredit,
  afterHandler?: ActionCreator<StandbyLetterOfCreditActionThunk>
) => (dispatch, _, api): Action => {
  const formattedParams =
    params && params.hasOwnProperty('filter')
      ? { ...params, filter: compressToBase64(stringify(params.filter)) }
      : params

  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit`, {
      type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST,
      onSuccess: {
        type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(params)(dispatcher, _ as any, api)
        }
      },
      onError: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_FAILURE,
      params: formattedParams
    })
  )
}

export const fetchSBLCDocuments: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  standbyLetterOfCreditId: string
) => (dispatch, _, api) => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit/${standbyLetterOfCreditId}/documents`, {
      type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_REQUEST,
      onSuccess: documents => {
        dispatch({
          type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS,
          payload: documents
        })
        return {
          type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_SUCCESS
        }
      },
      onError: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_FAILURE
    })
  )
}

export const getStandbyLetterOfCreditWithTradesAndCargos: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  standbyLetterOfCreditId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit/${standbyLetterOfCreditId}`, {
      type: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          const applicationState: ApplicationState = getState()
          const { source, sourceId } = applicationState
            .get('standByLettersOfCredit')
            .get('byId')
            .toJS()[standbyLetterOfCreditId].tradeId

          return fetchTradesWithCargos({
            source,
            filter: {
              projection: undefined,
              options: {},
              query: { source, sourceId }
            }
          })(dispatcher, _ as any, api)
        }
      },
      onError: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_FAILURE
    })
  )
}

export const issueStandbyLetterOfCredit: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  standbyLetterOfCredit: IStandbyLetterOfCredit,
  file: File
) => (dispatch, _, api): Action => {
  const formData = new FormData()
  formData.append('fileData', file)
  formData.append('extraData', JSON.stringify(standbyLetterOfCredit))

  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit/${standbyLetterOfCredit.staticId}/issue`, {
      type: StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => goBackOrFallBackTo({ fallbackURL: SBLC_DASHBOARD_URL })
      },
      onError: StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_FAILURE,
      data: formData
    })
  )
}

export const rejectStandbyLetterOfCreditRequest: ActionCreator<StandbyLetterOfCreditActionThunk> = (
  staticId: string,
  issuingBankReference?: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit/${staticId}/rejectrequest`, {
      type: StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => goBackOrFallBackTo({ fallbackURL: SBLC_DASHBOARD_URL })
      },
      onError: StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_FAILURE,
      data: {
        issuingBankReference
      }
    })
  )
}
