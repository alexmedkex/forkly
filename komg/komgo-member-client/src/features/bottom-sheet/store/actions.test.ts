import { DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { fakeBottomsheetItem } from '../utils'
import { DocumentActionType } from '../../document-management'

import {
  BottomSheetActionType,
  RemoveBottomSheetItem,
  RetryRegisterItem,
  BottomSheetStatus,
  BottomSheetItemType,
  CreateBottomSheetItem
} from './types'
import { createBottomSheetItem, removeBottomSheetItem, retryActionBottomSheet } from './actions'

describe('BottomSheet actions', () => {
  const anonHasId = { id: '-1' }

  const dummyAction = { type: 'test' }

  const dispatchMock = jest.fn()

  const apiMock: any = {
    post: jest.fn(() => dummyAction),
    get: jest.fn(() => dummyAction),
    delete: jest.fn(() => dummyAction)
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('removeBottomSheetItem created an action of type REMOVE_BOTTOMSHEET_ITEM', () => {
    const expected: RemoveBottomSheetItem = {
      type: BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM,
      payload: { id: anonHasId.id }
    }

    const actual = removeBottomSheetItem(anonHasId.id)

    expect(actual).toMatchObject(expected)
  })

  it('retryActionBottomSheet creates a valid RETRY_BOTTOMSHEET_ITEM action', () => {
    const anonPendingItem = fakeBottomsheetItem({ state: BottomSheetStatus.PENDING, name: '', itemType: null })
    const expected: RetryRegisterItem = {
      type: BottomSheetActionType.RETRY_BOTTOMSHEET_ITEM,
      payload: anonPendingItem
    }

    const actual = retryActionBottomSheet(anonPendingItem.id)
    expect(actual).toMatchObject(expected)
  })

  it('createBottomSheetItem creates a valid CREATE_BOTTOMSHEET_ITEM action', () => {
    const anonPendingItem = fakeBottomsheetItem({ state: BottomSheetStatus.PENDING, name: '', itemType: null })
    const result = createBottomSheetItem({
      id: anonPendingItem.id,
      name: anonPendingItem.name,
      itemType: anonPendingItem.itemType
    })(dispatchMock)
    expect(dispatchMock).toHaveBeenCalledWith(result)
  })
})
