import { ImmutableMap, stringOrNull } from '../../../../utils/types'
import {
  IReceivablesDiscountingInfo,
  IReceivablesDiscountingBase,
  ICreateReceivableDiscountingApplicationResponse,
  IHistory,
  IReceivablesDiscounting
} from '@komgo/types'
import { List, Map } from 'immutable'
import { Action } from 'redux'

export enum ReceivableDiscountingApplicationActionType {
  // create
  CREATE_APPLICATION_REQUEST = '@@receivable-discounting/CREATE_APPLICATION_REQUEST',
  CREATE_APPLICATION_SUCCESS = '@@receivable-discounting/CREATE_APPLICATION_SUCCESS',
  CREATE_APPLICATION_FAILURE = '@@receivable-discounting/CREATE_APPLICATION_FAILURE',

  // update
  UPDATE_APPLICATION_REQUEST = '@@receivable-discounting/UPDATE_APPLICATION_REQUEST',
  UPDATE_APPLICATION_SUCCESS = '@@receivable-discounting/UPDATE_APPLICATION_SUCCESS',
  UPDATE_APPLICATION_FAILURE = '@@receivable-discounting/UPDATE_APPLICATION_FAILURE',

  SHARE_APPLICATION_REQUEST = '@@receivable-discounting/SHARE_APPLICATION_REQUEST',
  SHARE_APPLICATION_SUCCESS = '@@receivable-discounting/SHARE_APPLICATION_SUCCESS',
  SHARE_APPLICATION_FAILURE = '@@receivable-discounting/SHARE_APPLICATION_FAILURE',

  // read
  FETCH_APPLICATION_REQUEST = '@@receivable-discounting/FETCH_APPLICATION_REQUEST',
  FETCH_APPLICATION_SUCCESS = '@@receivable-discounting/FETCH_APPLICATION_SUCCESS',
  FETCH_APPLICATION_FAILURE = '@@receivable-discounting/FETCH_APPLICATION_FAILURE',

  FETCH_MULTIPLE_APPLICATION_REQUEST = '@@receivable-discounting/FETCH_MULTIPLE_APPLICATION_REQUEST',
  FETCH_MULTIPLE_APPLICATION_SUCCESS = '@@receivable-discounting/FETCH_MULTIPLE_APPLICATION_SUCCESS',
  FETCH_MULTIPLE_APPLICATION_FAILURE = '@@receivable-discounting/FETCH_MULTIPLE_APPLICATION_FAILURE',

  FETCH_APPLICATION_HISTORY_REQUEST = '@@receivable-discounting/FETCH_APPLICATION_HISTORY_REQUEST',
  FETCH_APPLICATION_HISTORY_SUCCESS = '@@receivable-discounting/FETCH_APPLICATION_HISTORY_SUCCESS',
  FETCH_APPLICATION_HISTORY_FAILURE = '@@receivable-discounting/FETCH_APPLICATION_HISTORY_FAILURE'
}

export interface ApplicationError extends Action {
  type:
    | ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE
    | ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_FAILURE
  payload: stringOrNull
}

export interface CreateSucceeded extends Action {
  type: ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_SUCCESS
  payload: ICreateReceivableDiscountingApplicationResponse
}

export interface FetchMultipleSucceeded extends Action {
  type: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS
  payload: IReceivablesDiscountingInfo[]
}

export interface FetchSucceeded extends Action {
  type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS
  payload: IReceivablesDiscountingInfo
}

export interface UpdateSucceeded extends Action {
  type: ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_SUCCESS
  payload: IReceivablesDiscountingBase
  rdId: string
}

export interface FetchHistorySucceeded extends Action {
  type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS
  payload: IHistory<IReceivablesDiscounting>
  rdId: string
}

export interface ReceivableDiscountingApplicationStateProperties {
  byId: Map<string, IReceivablesDiscountingInfo>
  historyById: Map<string, IHistory<IReceivablesDiscounting>>
  ids: List<string>
  error: stringOrNull
}

export type ReceivableDiscountingApplicationState = ImmutableMap<ReceivableDiscountingApplicationStateProperties>

export type ReceivableDiscountingApplicationAction =
  | CreateSucceeded
  | FetchHistorySucceeded
  | FetchMultipleSucceeded
  | FetchSucceeded
  | UpdateSucceeded
  | ApplicationError
