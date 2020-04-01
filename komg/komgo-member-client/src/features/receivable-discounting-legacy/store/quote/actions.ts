import { IQuoteBase } from '@komgo/types'
import { Action, ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../../store/reducers'
import { RECEIVABLE_DISCOUNTING_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { HttpRequest } from '../../../../utils/http'
import { QuoteActionType } from './types'

export type QuoteActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const updateAcceptedQuote: ActionCreator<QuoteActionThunk> = (data: IQuoteBase, quoteId: string) => (
  dispatch,
  _,
  api
): Action =>
  dispatch(
    api.put(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote/${quoteId}`, {
      type: QuoteActionType.UPDATE_QUOTE_REQUEST,
      onError: QuoteActionType.UPDATE_QUOTE_FAILURE,
      onSuccess: {
        afterHandler: store => {
          fetchHistoryForAgreedTerms(quoteId)(store.dispatch, _ as any, api)
          shareAcceptedQuote(quoteId)(store.dispatch, _ as any, api)
        },
        type: QuoteActionType.UPDATE_QUOTE_SUCCESS,
        quoteId
      },
      data
    })
  )

export const fetchSingleQuote: ActionCreator<QuoteActionThunk> = (staticId: string) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote/${staticId}`, {
      type: QuoteActionType.FETCH_QUOTE_REQUEST,
      onError: QuoteActionType.FETCH_QUOTE_FAILURE,
      onSuccess: QuoteActionType.FETCH_QUOTE_SUCCESS
    })
  )
}

const shareAcceptedQuote: ActionCreator<QuoteActionThunk> = (quoteId: string) => (dispatch, _, api): Action =>
  dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote/${quoteId}/share`, {
      type: QuoteActionType.SHARE_QUOTE_REQUEST,
      onError: QuoteActionType.SHARE_QUOTE_FAILURE,
      onSuccess: QuoteActionType.SHARE_QUOTE_SUCCESS
    })
  )

export const fetchHistoryForAgreedTerms: ActionCreator<QuoteActionThunk> = (quoteId: string) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote/${quoteId}/history`, {
      type: QuoteActionType.FETCH_QUOTE_HISTORY_REQUEST,
      onSuccess: {
        type: QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS,
        quoteId
      },
      onError: QuoteActionType.FETCH_QUOTE_HISTORY_FAILURE
    })
  )
}
