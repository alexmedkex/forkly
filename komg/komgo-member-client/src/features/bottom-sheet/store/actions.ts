import { ActionCreator, Action } from 'redux'
import {
  BottomSheetActionType,
  RemoveBottomSheetItem,
  RetryRegisterItem,
  BottomSheetStatus,
  BottomSheetItem
} from './types'

export const createBottomSheetItem: ActionCreator<any> = ({
  id,
  name,
  itemType,
  displayStatus,
  action,
  navigationLink
}) => dispatch => {
  dispatch(action)
  dispatch({
    type: BottomSheetActionType.CREATE_BOTTOMSHEET_ITEM,
    payload: { id, name, itemType, displayStatus, action, navigationLink }
  })
}

export const retryItem: ActionCreator<any> = (item: BottomSheetItem) => dispatch => {
  dispatch(retryActionBottomSheet(item.id))
  dispatch(item.action)
}

export const removeBottomSheetItem: ActionCreator<RemoveBottomSheetItem> = (id: string) => ({
  type: BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM,
  payload: { id }
})

export const retryActionBottomSheet: ActionCreator<RetryRegisterItem> = (id: string) => ({
  type: BottomSheetActionType.RETRY_BOTTOMSHEET_ITEM,
  payload: {
    id,
    state: BottomSheetStatus.PENDING,
    name: '',
    itemType: null
  }
})
