import * as sut from './utils'
import { DocumentActionType, DocumentRegisteredSuccess } from '../document-management/store/types'
import { BottomSheetStatus, BottomSheetItem } from './store/types'

describe('Bottomsheet utils', () => {
  it('generateBottomsheetTitle returns content for the BottomSheet title row from array of Bottomsheet items ', () => {
    const anonItem: BottomSheetItem[] = [sut.fakeBottomsheetItem({ state: BottomSheetStatus.PENDING })]
    const expected = '1 document pending'
    const actual = sut.generateBottomsheetTitle(anonItem)
    expect(actual).toEqual(expected)
  })

  it('getStatus returns the item status which is present on a BottomSheetAction', () => {
    const action: DocumentRegisteredSuccess = {
      type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS,
      payload: {
        id: '-1',
        name: 'anon',
        state: BottomSheetStatus.REGISTERED
      }
    }

    const actual = sut.getStatus(action)
    const expected = BottomSheetStatus.PENDING
    expect(actual).toEqual(expected)
  })
})
