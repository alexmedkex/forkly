import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { DocumentListItem, Props, Items } from './DocumentListItem'
import { fakeDocument } from '../../../utils/faker'

describe('CounterpartyDocumentListItem', () => {
  const mockDocument = fakeDocument({ name: 'anon.ext', uploadInfo: { uploaderUserId: '-1' } })
  const mockProps: Props = {
    document: mockDocument,
    getUserNameFromDocumentUploaderId: jest.fn((idUser: string) => 'Anon User'),
    highlighted: false,
    itemsToDisplay: [Items.TYPE, Items.FORMAT, Items.UPLOADED_ON, Items.NAME, Items.SIZE, Items.UPLOADER],
    numColumns: 3,
    printExtraActionsMenu: () => ''
  }
  it('renders', () => {
    expect(renderer.create(<DocumentListItem {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
