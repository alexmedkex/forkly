import * as React from 'react'
import { ThunkAction } from 'redux-thunk'
import { Action, ActionCreator } from 'redux'
import { ApplicationState } from '../../../store/reducers'
import { HttpRequest } from '../../../utils/http'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../utils/endpoints'
import { ILetterOfCreditBase, IDataLetterOfCreditBase, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { LetterOfCreditActionType } from './types'
import { history } from '../../../store'
import { stringify } from 'qs'
import { compressToBase64 } from 'lz-string'
import { ImmutableObject } from '../../../utils/types'
import { getTradeFinanceDocumentByHash } from '../../document-management/store/documents/actions'

export type TemplatedLetterOfCreditActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

const TRADE_DASHBOARD_URL = '/trades?tradingRole=buyer'

const LC_DASHBOARD_URL = '/letters-of-credit'

export const createLetterOfCredit: ActionCreator<TemplatedLetterOfCreditActionThunk> = (
  templatedLetterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/letterofcredit`, {
      type: LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => {
          history.push(TRADE_DASHBOARD_URL)
        }
      },
      onError: LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_FAILURE,
      data: templatedLetterOfCreditBase
    })
  )
}

export const getLetterOfCreditWithDocument: ActionCreator<TemplatedLetterOfCreditActionThunk> = (staticId: string) => (
  dispatch,
  getState,
  api
): Action => {
  const afterHandler = () => (dispatcher, getState, api) => {
    const state: ApplicationState = getState()

    const letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>> = state
      .get('templatedLettersOfCredit')
      .get('byStaticId')
      .get(staticId)

    const issuingDocumentHash = letterOfCredit.get('issuingDocumentHash')

    if (issuingDocumentHash) {
      getTradeFinanceDocumentByHash(issuingDocumentHash)(dispatcher, getState, api)
    }
  }

  return getLetterOfCredit(staticId, afterHandler)(dispatch, getState, api)
}

export const getLetterOfCredit: ActionCreator<TemplatedLetterOfCreditActionThunk> = (
  staticId: string,
  afterHandler?: any
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/letterofcredit/${staticId}`, {
      type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(staticId)(dispatcher, getState, api)
        }
      },
      onError: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_FAILURE
    })
  )
}

export const fetchLettersOfCreditByType: ActionCreator<TemplatedLetterOfCreditActionThunk> = (
  initialParams?: any,
  afterHandler?: any
) => (dispatch, _, api): Action => {
  const params =
    initialParams && initialParams.hasOwnProperty('filter')
      ? { ...initialParams, filter: compressToBase64(stringify(initialParams.filter)) }
      : initialParams
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/letterofcredit`, {
      type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(initialParams)(dispatcher, getState, api)
        }
      },
      onError: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_FAILURE,
      params
    })
  )
}

export const issueLetterOfCredit: ActionCreator<TemplatedLetterOfCreditActionThunk> = (
  staticId: string,
  data: ILetterOfCreditBase<IDataLetterOfCreditBase>,
  file: File
) => (dispatch, _, api): Action => {
  const formData = new FormData()
  formData.append('fileData', file)
  formData.append('extraData', JSON.stringify(data))

  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/letterofcredit/${staticId}/issue`, {
      type: LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => {
          history.push(LC_DASHBOARD_URL)
        }
      },
      onError: LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_FAILURE,
      data: formData
    })
  )
}

export const rejectRequestedLetterOfCredit: ActionCreator<TemplatedLetterOfCreditActionThunk> = (
  staticId: string,
  data: ILetterOfCreditBase<IDataLetterOfCreditBase>,
  comment: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/letterofcredit/${staticId}/rejectrequest`, {
      type: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => {
          history.push(LC_DASHBOARD_URL)
        }
      },
      onError: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_FAILURE,
      data
    })
  )
}
