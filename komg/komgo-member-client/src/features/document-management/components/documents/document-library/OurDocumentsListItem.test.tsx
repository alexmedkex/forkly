import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { OurDocumentsListItem, Props } from './OurDocumentsListItem'
import { fakeDocument, fakeDropdownOption } from '../../../utils/faker'

describe('CounterpartyDocumentListItem', () => {
  const mockDocument = fakeDocument({ name: 'anon.ext', uploadInfo: { uploaderUserId: '-1' } })
  const mockProps: Props = {
    document: mockDocument,
    getUserNameFromDocumentUploaderId: jest.fn((idUser: string) => 'Anon User'),
    highlighted: false,
    selected: false,
    viewDocumentOption: fakeDropdownOption({ key: 'view', value: 'anon', onClick: jest.fn() }),
    downloadDocumentOption: fakeDropdownOption({ key: 'download', value: 'anon', onClick: jest.fn() }),
    renderEllipsisMenu: doc => <div>ellipsis</div>,
    handleDocumentSelect: jest.fn(doc => void 0),
    ItemRenderer: jest.fn(props => <div />)
  }
  it('renders', () => {
    expect(renderer.create(<OurDocumentsListItem {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
