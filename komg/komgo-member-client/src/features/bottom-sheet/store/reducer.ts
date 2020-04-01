import * as immutable from 'immutable'
import { Reducer } from 'redux'

import {
  BottomSheetActionType,
  BottomSheetState,
  BottomSheetAction,
  BottomSheetStateFields,
  BottomSheetItem,
  BottomSheetStatus,
  BottomSheetItemType
} from './types'
import { DocumentActionType } from '../../document-management/store/'

const initialStateFields: BottomSheetStateFields = {
  visible: false,
  items: []
}

// @ts-ignore
export const initialState: BottomSheetState = immutable.Map(initialStateFields)

const reducer: Reducer<BottomSheetState> = (state = initialState, action: BottomSheetAction): BottomSheetState => {
  switch (action.type) {
    case BottomSheetActionType.CREATE_BOTTOMSHEET_ITEM:
    case DocumentActionType.CREATE_DOCUMENT_SUCCESS: {
      return createDocumentSuccessReducer(state, action)
    }
    case DocumentActionType.CREATE_DOCUMENT_ERROR: {
      return state
        .set('visible', true)
        .set('items', [
          pluckBottomSheetItems({ id: action.payload.id, name: action.payload.name, state: BottomSheetStatus.FAILED }),
          ...state.get('items').filter(item => item.id !== action.payload.id)
        ])
    }
    case BottomSheetActionType.UPDATE_BOTTOMSHEET_ITEM:
    case DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS:
    case DocumentActionType.SHOW_DOCUMENT_REGISTERED_ERROR: {
      return updatingExistingItemReducer(state, action)
    }
    case BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM: {
      return removeBottomSheetItem(state, action)
    }
    case BottomSheetActionType.RETRY_BOTTOMSHEET_ITEM: {
      return state.set('visible', true).set('items', state.get('items').map(updateItemStatus(action.payload)))
    }
  }
  return state
}

export const removeBottomSheetItem = (state: BottomSheetState, action: BottomSheetAction) => {
  const items = state.get('items').filter(item => item.id !== action.payload.id)
  if (items.length === 0) {
    return state.set('items', items).set('visible', false)
  }
  return state.set('items', items)
}

export const updatingExistingItemReducer = (state: BottomSheetState, action: BottomSheetAction): BottomSheetState => {
  if (!verifyUpdatingExistingItem(action.payload.id, state.get('items'))) {
    return state
  }
  return state.set('visible', true).set(
    'items',
    state
      .get('items')
      .map(updateItemStatus(action.payload as BottomSheetItem))
      .reduce(moveUpdatedItemToFront(action.payload.id), [])
  )
}

export const verifyUpdatingExistingItem = (incomingId: string, items: BottomSheetItem[]): boolean => {
  if (!incomingId.length && items.length) {
    return false
  }
  return items.filter(item => item.id === incomingId).length > 0
}

export const createDocumentSuccessReducer = (state: BottomSheetState, action: BottomSheetAction): BottomSheetState => {
  // avoid duplicates (i.e, when retrying)
  const items = state.get('items').filter(item => item.id === action.payload.id)
  if (items.length > 0) {
    return state.set('visible', true).set(
      'items',
      state
        .get('items')
        .map(updateItemStatus(action.payload as BottomSheetItem))
        .reduce(moveUpdatedItemToFront(action.payload.id), [])
    )
  }

  return state
    .set('visible', true)
    .set('items', [
      pluckBottomSheetItems({ ...action.payload, itemType: maybeItemType(action.payload) }),
      ...state.get('items')
    ])
}

export const moveUpdatedItemToFront = (id: string) => (
  acc: BottomSheetItem[],
  item: BottomSheetItem
): BottomSheetItem[] => {
  return item.id === id ? [item, ...acc] : [...acc, item]
}

export function pluckBottomSheetItems(item: any): BottomSheetItem {
  return {
    id: item.id,
    state: item.state || BottomSheetStatus.PENDING,
    itemType: maybeItemType(item),
    name: item.name,
    displayStatus: item.displayStatus,
    action: item.action,
    navigationLink: item.navigationLink
  }
}

export const maybeItemType = (item: any) => {
  const { product } = item
  if (!product) {
    return undefined
  }
  switch (product.id) {
    case 'tradeFinance': {
      return item.context && item.context.subProductId === 'rd'
        ? BottomSheetItemType.REGISTER_RD_DOCUMENT
        : BottomSheetItemType.REGISTER_TRADE_DOCUMENT
    }
    case 'kyc':
      return BottomSheetItemType.REGISTER_KYC_DOCUMENT
  }
  return undefined
}

export const updateItemStatus = <T extends BottomSheetItem>(payload: T) => (item: BottomSheetItem): BottomSheetItem => {
  return item.id === payload.id
    ? ({ ...item, ...{ state: payload.state, displayStatus: payload.displayStatus } } as BottomSheetItem)
    : item
}

export default reducer
