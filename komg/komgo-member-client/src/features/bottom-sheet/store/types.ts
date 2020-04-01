import { Action } from 'redux'
import { ImmutableMap } from '../../../utils/types'
import {
  CreateDocumentError,
  CreateDocumentSuccess,
  DocumentRegisteredError,
  DocumentRegisteredSuccess,
  HasId,
  HasName
} from '../../document-management/store/types'
import { ActionCreator } from 'react-redux'

export enum BottomSheetActionType {
  REMOVE_BOTTOMSHEET_ITEM = '@@btsh/REMOVE_BOTTOMSHEET_ITEM',
  RETRY_BOTTOMSHEET_ITEM = '@@btsh/RETRY_BOTTOMSHEET_ITEM',
  UPDATE_BOTTOMSHEET_ITEM = '@@btsh/UPDATE_BOTTOMSHEET_ITEM',
  CREATE_BOTTOMSHEET_ITEM = '@@btsh/CREATE_BOTTOMSHEET_ITEM'
}

export interface BottomSheetItem extends HasId, HasName {
  state: BottomSheetStatus
  itemType?: BottomSheetItemType
  displayStatus?: string
  action?: ActionCreator<any>
  navigationLink?: string
}

export enum BottomSheetItemType {
  REGISTER_KYC_DOCUMENT,
  CREATE_MAGIC_LINK,
  REGISTER_RD_DOCUMENT,
  REGISTER_TRADE_DOCUMENT
}

export enum BottomSheetStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  REGISTERED = 'REGISTERED',
  FAILED = 'FAILED'
}

export interface BottomSheetStateFields {
  visible: boolean
  items: BottomSheetItem[]
}

export interface RemoveBottomSheetItem extends Action {
  type: BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM
  payload: HasId
}

export interface RetryRegisterItem extends Action {
  type: BottomSheetActionType.RETRY_BOTTOMSHEET_ITEM
  payload: BottomSheetItem
}

export interface UpdateBottomSheetItem extends Action {
  type: BottomSheetActionType.UPDATE_BOTTOMSHEET_ITEM
  payload: BottomSheetItem
}

export interface CreateBottomSheetItem extends Action {
  type: BottomSheetActionType.CREATE_BOTTOMSHEET_ITEM
  payload: BottomSheetItem
}

export type BottomSheetState = ImmutableMap<BottomSheetStateFields>

export type BottomSheetAction =
  | DocumentRegisteredSuccess
  | DocumentRegisteredError
  | CreateDocumentSuccess
  | CreateDocumentError
  | RemoveBottomSheetItem
  | RetryRegisterItem
  | UpdateBottomSheetItem
  | CreateBottomSheetItem
