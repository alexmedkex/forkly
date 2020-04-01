import { IQuoteBase, IQuote, IHistory } from '@komgo/types'
import { Action } from 'redux'
import { stringOrNull, ImmutableMap } from '../../../../utils/types'
import { Map } from 'immutable'

export enum QuoteActionType {
  // create
  SHARE_QUOTE_REQUEST = '@@receivable-discounting/SHARE_QUOTE_REQUEST',
  SHARE_QUOTE_SUCCESS = '@@receivable-discounting/SHARE_QUOTE_SUCCESS',
  SHARE_QUOTE_FAILURE = '@@receivable-discounting/SHARE_QUOTE_FAILURE',

  // update
  UPDATE_QUOTE_REQUEST = '@@receivable-discounting/UPDATE_QUOTE_REQUEST',
  UPDATE_QUOTE_SUCCESS = '@@receivable-discounting/UPDATE_QUOTE_SUCCESS',
  UPDATE_QUOTE_FAILURE = '@@receivable-discounting/UPDATE_QUOTE_FAILURE',

  // read
  FETCH_QUOTE_REQUEST = 'FETCH_QUOTE_REQUEST',
  FETCH_QUOTE_FAILURE = 'FETCH_QUOTE_FAILURE',
  FETCH_QUOTE_SUCCESS = 'FETCH_QUOTE_SUCCESS',

  FETCH_QUOTE_HISTORY_REQUEST = 'FETCH_QUOTE_HISTORY_REQUEST',
  FETCH_QUOTE_HISTORY_SUCCESS = 'FETCH_QUOTE_HISTORY_SUCCESS',
  FETCH_QUOTE_HISTORY_FAILURE = 'FETCH_QUOTE_HISTORY_FAILURE'
}

export interface UpdateSucceeded extends Action {
  type: QuoteActionType.UPDATE_QUOTE_SUCCESS
  payload: IQuoteBase
}

export interface QuoteStateProperties {
  byId: Map<string, IQuote>
  historyById: Map<string, IHistory<IQuote>>
  error: stringOrNull
}

export interface FetchHistorySucceeded extends Action {
  type: QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS
  payload: IHistory<IQuote>
  quoteId: string
}

export type QuoteState = ImmutableMap<QuoteStateProperties>

export type QuoteAction = UpdateSucceeded | FetchHistorySucceeded
