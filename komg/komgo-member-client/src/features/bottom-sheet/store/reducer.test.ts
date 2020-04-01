import {
  CreateDocumentError,
  CreateDocumentSuccess,
  DocumentActionType,
  DocumentRegisteredError,
  DocumentRegisteredSuccess,
  DocumentResponse
} from '../../document-management/store/types'
import { fakeDocument } from '../../document-management/utils/faker'
import { fakeBottomsheetItem } from '../utils'
import reducer, {
  createDocumentSuccessReducer,
  initialState,
  moveUpdatedItemToFront,
  updateItemStatus,
  updatingExistingItemReducer,
  verifyUpdatingExistingItem
} from './reducer'
import {
  BottomSheetAction,
  BottomSheetActionType,
  BottomSheetItem,
  BottomSheetStatus,
  RemoveBottomSheetItem,
  RetryRegisterItem,
  UpdateBottomSheetItem,
  BottomSheetItemType
} from './types'

const mockDocument = fakeDocument()

const { id, state, name } = mockDocument
const pendingItem = { id, state, name, itemType: BottomSheetItemType.REGISTER_KYC_DOCUMENT }
const registeredItem = { ...pendingItem, ...{ state: BottomSheetStatus.REGISTERED } }
const failedItem = { ...pendingItem, ...{ state: BottomSheetStatus.FAILED } }

const expectedStateWithPendingItem = initialState.set('items', [pendingItem]).set('visible', true)

const expectedStateWithRegisteredItem = initialState.set('items', [registeredItem]).set('visible', true)

const expectedStateWithFailedItem = initialState.set('items', [failedItem]).set('visible', true)

describe('Bottomsheet reducer', () => {
  it('should return default initialState when irrelevat action is called', () => {
    const expected = initialState
    const unonInvalidAction = { type: 'ANON', payload: ['...'] }
    const actual = reducer(initialState, unonInvalidAction)
    expect(actual).toEqual(expected)
  })

  it('should set a new BottomsheetItem to items in response to CREATE_DOCUMENT_SUCCESS action', () => {
    const action: CreateDocumentSuccess = {
      type: DocumentActionType.CREATE_DOCUMENT_SUCCESS,
      payload: mockDocument as DocumentResponse
    }
    const actual = reducer(initialState, action)
    expect(actual).toMatchObject(expectedStateWithPendingItem)
  })

  it('should update the state of a BottomsheetItem in response to SHOW_DOCUMENT_REGISTERED_SUCCESS', () => {
    const action: DocumentRegisteredSuccess = {
      type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS,
      payload: {
        id: mockDocument.id,
        name: mockDocument.name,
        state: BottomSheetStatus.REGISTERED
      }
    }

    const actual = reducer(expectedStateWithPendingItem, action)

    expect(actual).toMatchObject(expectedStateWithRegisteredItem)
  })

  it('should set the state of an item to ERROR in response to SHOW_DOCUMENT_REGISTERED_ERROR', () => {
    const action: DocumentRegisteredError = {
      type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_ERROR,
      payload: {
        id: failedItem.id,
        name: failedItem.name,
        state: BottomSheetStatus.FAILED
      }
    }

    const actual = reducer(expectedStateWithPendingItem, action)

    expect(expectedStateWithFailedItem).toMatchObject(actual)
  })

  it('should update status of existing items by id', () => {
    const action: DocumentRegisteredSuccess = {
      type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS,
      payload: {
        id: '-999',
        name: 'anon',
        state: BottomSheetStatus.REGISTERED
      }
    }

    const actual = reducer(expectedStateWithPendingItem, action)

    expect(actual).toMatchObject(expectedStateWithPendingItem)
  })

  it('should default to setting the state of an item to PENDING on CREATE_DOCUMENT_SUCCESS when that state is falsy', () => {
    const action: CreateDocumentSuccess = {
      type: DocumentActionType.CREATE_DOCUMENT_SUCCESS,
      payload: { ...mockDocument, ...{ state: undefined } } as DocumentResponse
    }
    const actual = reducer(initialState, action)
    expect(actual).toMatchObject(expectedStateWithPendingItem)
  })

  it('should remove an item from items by id in response to a REMOVE_BOTTOMSHEET_ITEM', () => {
    const action: RemoveBottomSheetItem = {
      type: BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM,
      payload: { id: registeredItem.id }
    }

    const actual = reducer(expectedStateWithRegisteredItem, action)
    expect(actual.get('items')).toMatchObject(initialState.get('items'))
  })

  it('should ignore REMOVE_BOTTOMSHEET_ITEM in the case that there are not items to remove', () => {
    const action: RemoveBottomSheetItem = {
      type: BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM,
      payload: { id: registeredItem.id }
    }
    const actual = reducer(initialState, action)
    expect(actual.get('items')).toMatchObject(initialState.get('items'))
  })

  it('should not alter state.visible in response REMOVE_BOTTOMSHEET_ITEM if there are other bottomsheet items', () => {
    const itemToRemove = fakeBottomsheetItem({ id: '123' })
    const itemToRemain = fakeBottomsheetItem({ id: '1' })

    const action: RemoveBottomSheetItem = {
      type: BottomSheetActionType.REMOVE_BOTTOMSHEET_ITEM,
      payload: { id: itemToRemove.id }
    }

    const beVisible = true
    const expectedStateWithTwoItems = initialState.set('items', [itemToRemove, itemToRemain]).set('visible', beVisible)
    const actual = reducer(expectedStateWithTwoItems, action)

    expect(actual.get('items')).toEqual([itemToRemain])
    expect(actual.get('visible')).toBe(beVisible)
  })

  it('should set an existing item to FAILED in response to a CREATE_DOCUMENT_ERROR', () => {
    const action: CreateDocumentError = {
      type: DocumentActionType.CREATE_DOCUMENT_ERROR,
      error: new Error('anon error'),
      payload: { ...failedItem }
    }

    const state = reducer(expectedStateWithPendingItem, action)
    const [actual] = state.get('items')
    expect(actual).toMatchObject({ ...expectedStateWithFailedItem.get('items')[0], itemType: undefined })
  })

  it('should update an existing bottomsheet item in response to a RETRY_BOTTOMSHEET_ITEM', () => {
    const action: RetryRegisterItem = {
      type: BottomSheetActionType.RETRY_BOTTOMSHEET_ITEM,
      payload: { ...failedItem, ...{ state: BottomSheetStatus.REGISTERED } }
    }

    const actual = reducer(expectedStateWithFailedItem, action)

    expect(actual).toMatchObject(expectedStateWithRegisteredItem)
  })

  it('should update an existing item in response to an UPDATE_BOTTOMSHEET_ITEM', () => {
    const action: UpdateBottomSheetItem = {
      type: BottomSheetActionType.UPDATE_BOTTOMSHEET_ITEM,
      payload: { ...mockDocument, ...{ state: BottomSheetStatus.REGISTERED } }
    }

    const actual = reducer(expectedStateWithPendingItem, action)

    expect(actual).toMatchObject(expectedStateWithRegisteredItem)
  })
})

describe('createDocumentSuccessReducer', () => {
  it('returns state in response to anything other than a CREATE_DOCUMENT_SUCCESS', () => {
    const action: CreateDocumentError = {
      type: DocumentActionType.CREATE_DOCUMENT_ERROR,
      payload: fakeBottomsheetItem(),
      error: new Error('fml')
    }

    const actual = createDocumentSuccessReducer(expectedStateWithPendingItem, action)
    expect(actual).toMatchObject(expectedStateWithPendingItem)
  })

  it('updates an existing item to Pending in response to CREATE_DOCUMENT_SUCCESS for an existing item (retry path)', () => {
    const action: CreateDocumentSuccess = {
      type: DocumentActionType.CREATE_DOCUMENT_SUCCESS,
      payload: mockDocument
    }

    const actual = createDocumentSuccessReducer(expectedStateWithFailedItem, action)
    expect(actual).toMatchObject(expectedStateWithPendingItem)
  })
})

describe('updatingExistingItemReducer', () => {
  const anonId = '123'
  const itemToUpdate = fakeBottomsheetItem({ id: anonId, state: BottomSheetStatus.PENDING })
  const payload = fakeBottomsheetItem({ id: anonId, state: BottomSheetStatus.REGISTERED })

  const anonItems = ['-1', '-2', '-3'].map(id => fakeBottomsheetItem({ id }))

  const state = initialState.set('items', [...anonItems, itemToUpdate]).set('visible', false)

  const action: BottomSheetAction = {
    type: 'anon' as any, // should be able to use any action which implements BottomSheetAction. Payload type matters here, type does not.
    payload
  }

  it('should update a bottomsheet item with the action payload, given that the payload corresponds to an existing bottomsheet item by id', () => {
    const actual = updatingExistingItemReducer(state, action)
    const [updatedItem, ...notUpdated] = actual.get('items')

    expect(updatedItem).toEqual(payload)
    expect(notUpdated).toEqual(anonItems)
  })

  it('should move the updated item to index 0 of state.items', () => {
    const expected = [payload, ...anonItems]
    const actual = updatingExistingItemReducer(state, action)

    const [updated, ...notUpdated] = actual.get('items')

    expect(actual.get('items')).toEqual(expected)
    expect(actual.get('items')[0]).toEqual(updated)
    expect(notUpdated).toEqual(anonItems)
  })

  it('should set visible to true where an update has been applied', () => {
    const actual = updatingExistingItemReducer(state, action)

    expect(actual.get('visible')).toBe(true)
  })

  it('should return state if the action payload does not corresponding to an existing bottomsheet item', () => {
    const payloadForNoExistingItem = { ...payload, ...{ id: '-999' } }
    const actionForNoExistingItem: BottomSheetAction = { ...action, ...{ payload: payloadForNoExistingItem } }

    const actual = updatingExistingItemReducer(state, actionForNoExistingItem)

    expect(actual).toMatchObject(state)
  })
})

describe('verifyUpdatingExistingItem', () => {
  it(`returns true only if
  - a truthy incomingId argument is provided
  - an argument items is provided which is not an empty array
  - an existing member of items has is equal to argument incomingId`, () => {
    const anonItems = ['1', '2', '3'].map(id => fakeBottomsheetItem({ id }))
    expect(verifyUpdatingExistingItem('-999', anonItems)).toBe(false)
  })

  it('verifyUpdatingExistingItem returns false if argument incomingId is falsy', () => {
    const anonItems = ['1', '2', '3'].map(id => fakeBottomsheetItem({ id }))
    expect(verifyUpdatingExistingItem('', anonItems)).toBe(false)
  })

  it('returns false if argument items is empty', () => {
    expect(verifyUpdatingExistingItem('1', [])).toBe(false)
  })
})

describe('moveUpdatedItemToFront', () => {
  it('given an argument it, returns a sort function for an array of BottomSheetItem which will sort the item with argument id to position 0', () => {
    const anonItems = ['2', '3', '1'].map(id => fakeBottomsheetItem({ id }))
    const [two, three, one] = anonItems
    const sortItemOneToFront = moveUpdatedItemToFront('1')

    const actual = anonItems.reduce(sortItemOneToFront, [])

    expect(actual).toEqual([one, two, three])
  })
})

describe('updateItemStatus', () => {
  const anonPendingItems = ['1', '2', '3'].map(id => fakeBottomsheetItem({ id, state: BottomSheetStatus.PENDING }))
  it(`Given a payload which extends BottomSheetItem returns a mapping fn which 
  iterates over an array of BottomSheetItems and updates the state to payload.state matching on id`, () => {
    const [one, two, three] = anonPendingItems
    const twoRegistered: BottomSheetItem = { ...two, ...{ state: BottomSheetStatus.REGISTERED } }

    const expected = [one, twoRegistered, three]

    const actual = anonPendingItems.map(updateItemStatus(twoRegistered))
    expect(actual).toEqual(expected)
  })

  it('is no-op if the payload item id is not present in the list of BottomSheetItems', () => {
    const validButNotListed: BottomSheetItem = { id: '-999', state: BottomSheetStatus.REGISTERED, name: 'invalid item' }

    const actual = anonPendingItems.map(updateItemStatus(validButNotListed))

    expect(actual).toEqual(anonPendingItems)
  })
})
