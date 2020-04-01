import { ImmutableMap, stringOrNull } from '../../../../utils/types'
import { ILCAmendment } from '@komgo/types'
import { List, Map } from 'immutable'

export interface LetterOfCreditAmendmentStateProperties {
  byStaticId: Map<string, ILCAmendment>
  staticIds: List<string>
  error: stringOrNull
}

export type LetterOfCreditAmendmentState = ImmutableMap<LetterOfCreditAmendmentStateProperties>

export enum LetterOfCreditAmendmentActionType {
  SUBMIT_AMENDMENT_REQUEST = '@@letter-of-credit-amendments/SUBMIT_AMENDMENT_REQUEST',
  SUBMIT_AMENDMENT_SUCCESS = '@@letter-of-credit-amendments/SUBMIT_AMENDMENT_SUCCESS',
  SUBMIT_AMENDMENT_FAILURE = '@@letter-of-credit-amendments/SUBMIT_AMENDMENT_FAILURE',
  GET_AMENDMENT_REQUEST = '@@letter-of-credit-amendments/GET_AMENDMENT_REQUEST',
  GET_AMENDMENT_SUCCESS = '@@letter-of-credit-amendments/GET_AMENDMENT_SUCCESS',
  GET_AMENDMENT_FAILURE = '@@letter-of-credit-amendments/GET_AMENDMENT_FAILURE',
  ISSUE_AMENDMENT_REQUEST = '@@letter-of-credit-amendments/ISSUE_AMENDMENT_REQUEST',
  ISSUE_AMENDMENT_SUCCESS = '@@letter-of-credit-amendments/ISSUE_AMENDMENT_SUCCESS',
  ISSUE_AMENDMENT_FAILURE = '@@letter-of-credit-amendments/ISSUE_AMENDMENT_FAILURE',
  REJECT_AMENDMENT_REQUEST = '@@letter-of-credit-amendments/REJECT_AMENDMENT_REQUEST',
  REJECT_AMENDMENT_SUCCESS = '@@letter-of-credit-amendments/REJECT_AMENDMENT_SUCCESS',
  REJECT_AMENDMENT_FAILURE = '@@letter-of-credit-amendments/REJECT_AMENDMENT_FAILURE'
}
