import { ImmutableMap, stringOrNull } from '../../../utils/types'
import { ActionType } from '../../letter-of-credit-legacy/store/types'
import { List, Map } from 'immutable'
import { IStandbyLetterOfCredit, TradeSource } from '@komgo/types/dist'

export enum StandbyLetterOfCreditActionType {
  SUBMIT_STANDBY_LETTER_OF_CREDIT_REQUEST = '@@standby-letters-of-credit/SUBMIT_LETTER_OF_CREDIT_REQUEST',
  SUBMIT_STANDBY_LETTER_OF_CREDIT_SUCCESS = '@@standby-letters-of-credit/SUBMIT_LETTER_OF_CREDIT_SUCCESS',
  SUBMIT_STANDBY_LETTER_OF_CREDIT_FAILURE = '@@standby-letters-of-credit/SUBMIT_LETTER_OF_CREDIT_FAILURE',
  GET_STANDBY_LETTER_OF_CREDIT_REQUEST = '@@standby-letters-of-credit/GET_STANDBY_LETTER_OF_CREDIT_REQUEST',
  GET_STANDBY_LETTER_OF_CREDIT_SUCCESS = '@@standby-letters-of-credit/GET_STANDBY_LETTER_OF_CREDIT_SUCCESS',
  GET_STANDBY_LETTER_OF_CREDIT_FAILURE = '@@standby-letters-of-credit/GET_STANDBY_LETTER_OF_CREDIT_FAILURE',
  FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST = '@@standby-letters-of-credit/FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST',
  FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS = '@@standby-letters-of-credit/FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS',
  FETCH_STANDBY_LETTERS_OF_CREDIT_FAILURE = '@@standby-letters-of-credit/FETCH_STANDBY_LETTERS_OF_CREDIT_FAILURE',
  FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_REQUEST = '@@standby-letters-of-credit/FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_REQUEST',
  FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_SUCCESS = '@@standby-letters-of-credit/FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_SUCCESS',
  FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_FAILURE = '@@standby-letters-of-credit/FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_FAILURE',
  ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST = '@@standby-letters-of-credit/ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST',
  ISSUE_STANDBY_LETTER_OF_CREDIT_SUCCESS = '@@standby-letters-of-credit/ISSUE_STANDBY_LETTER_OF_CREDIT_SUCCESS',
  ISSUE_STANDBY_LETTER_OF_CREDIT_FAILURE = '@@standby-letters-of-credit/ISSUE_STANDBY_LETTER_OF_CREDIT_FAILURE',
  REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST = '@@standby-letters-of-credit/REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST',
  REJECT_STANDBY_LETTER_OF_CREDIT_SUCCESS = '@@standby-letters-of-credit/REJECT_STANDBY_LETTER_OF_CREDIT_SUCCESS',
  REJECT_STANDBY_LETTER_OF_CREDIT_FAILURE = '@@standby-letters-of-credit/REJECT_STANDBY_LETTER_OF_CREDIT_FAILURE'
}

export interface ITradeId {
  source: TradeSource
  sourceId: string
}

export interface StandbyLetterOfCreditStateProperties {
  byId: Map<string, IStandbyLetterOfCredit>
  ids: List<string>
  total: number
}

export interface FetchStandByLettersOfCredit {
  filter: {
    options: any | undefined
  }
  polling?: boolean
}

export type StandbyLetterOfCreditState = ImmutableMap<StandbyLetterOfCreditStateProperties>
