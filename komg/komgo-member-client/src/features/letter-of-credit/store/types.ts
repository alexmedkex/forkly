import { Action } from 'redux'
import { IDataLetterOfCredit, ILetterOfCredit, LetterOfCreditTaskType } from '@komgo/types'
import { ImmutableMap } from '../../../utils/types'
import { List, Map } from 'immutable'
import { Task } from '../../tasks/store/types'

export enum LetterOfCreditActionType {
  CREATE_STANDBY_LETTER_OF_CREDIT_REQUEST = '@@templated-letter-of-credit/CREATE_STANDBY_LETTER_OF_CREDIT_REQUEST',
  CREATE_STANDBY_LETTER_OF_CREDIT_SUCCESS = '@@templated-letter-of-credit/CREATE_STANDBY_LETTER_OF_CREDIT_SUCCESS',
  CREATE_STANDBY_LETTER_OF_CREDIT_FAILURE = '@@templated-letter-of-credit/CREATE_STANDBY_LETTER_OF_CREDIT_FAILURE',
  FETCH_LETTERS_OF_CREDIT_REQUEST = '@@templated-letter-of-credit/FETCH_LETTERS_OF_CREDIT_REQUEST',
  FETCH_LETTERS_OF_CREDIT_SUCCESS = '@@templated-letter-of-credit/FETCH_LETTERS_OF_CREDIT_SUCCESS',
  FETCH_LETTERS_OF_CREDIT_FAILURE = '@@templated-letter-of-credit/FETCH_LETTERS_OF_CREDIT_FAILURE',
  GET_LETTER_OF_CREDIT_REQUEST = '@@templated-letter-of-credit/GET_LETTER_OF_CREDIT_REQUEST',
  GET_LETTER_OF_CREDIT_SUCCESS = '@@templated-letter-of-credit/GET_LETTER_OF_CREDIT_SUCCESS',
  GET_LETTER_OF_CREDIT_FAILURE = '@@templated-letter-of-credit/GET_LETTER_OF_CREDIT_FAILURE',
  ISSUE_LETTER_OF_CREDIT_REQUEST = '@@templated-letter-of-credit/ISSUE_LETTER_OF_CREDIT_REQUEST',
  ISSUE_LETTER_OF_CREDIT_SUCCESS = '@@templated-letter-of-credit/ISSUE_LETTER_OF_CREDIT_SUCCESS',
  ISSUE_LETTER_OF_CREDIT_FAILURE = '@@templated-letter-of-credit/ISSUE_LETTER_OF_CREDIT_FAILURE',
  REJECT_LETTER_OF_CREDIT_REQUEST = '@@templated-letter-of-credit/REJECT_LETTER_OF_CREDIT_REQUEST',
  REJECT_LETTER_OF_CREDIT_SUCCESS = '@@templated-letter-of-credit/REJECT_LETTER_OF_CREDIT_SUCCESS',
  REJECT_LETTER_OF_CREDIT_FAILURE = '@@templated-letter-of-credit/REJECT_LETTER_OF_CREDIT_FAILURE'
}

export type ILetterOfCreditWithData = ILetterOfCredit<IDataLetterOfCredit>

export interface FetchLettersOfCreditSuccessAction extends Action {
  type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS
  payload: { limit: number; skip: number; total: number; items: ILetterOfCreditWithData[] }
}

export interface GetLetterOfCreditSuccessAction extends Action {
  type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS
  payload: ILetterOfCreditWithData
}

export interface TemplateStateProperties {
  byStaticId: Map<string, Map<keyof ILetterOfCreditWithData, any>>
  staticIds: List<string>
  total: number
}

export type TemplatedLetterOfCreditState = ImmutableMap<TemplateStateProperties>

export interface ILetterOfCreditEnriched extends ILetterOfCredit<IDataLetterOfCredit> {
  role: string
  actionStatus: string
  latestShipment: string | number | Date
  tasks: Task[]
}

export const LETTER_OF_CREDIT_TYPE_LABELS = {
  [LetterOfCreditTaskType.ReviewIssued]: 'Review issuance',
  [LetterOfCreditTaskType.ReviewRequested]: 'Review request'
}
