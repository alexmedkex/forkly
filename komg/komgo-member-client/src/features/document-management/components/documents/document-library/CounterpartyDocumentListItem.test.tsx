import * as React from 'react'
import * as renderer from 'react-test-renderer'
import CounterpartyDocumentListItem from './CounterpartyDocumentListItem'
import { Props } from './CounterpartyDocumentListItem'
import { createMemoryHistory } from 'history'
import { fakeDocument, fakeDropdownOption } from '../../../utils/faker'
import { MemoryRouter as Router } from 'react-router-dom'

describe('CounterpartyDocumentListItem', () => {
  const mockDocument = fakeDocument({ name: 'anon.ext', uploadInfo: { uploaderUserId: '-1' } })
  const mockProps: Props = {
    history: createMemoryHistory(),
    staticContext: undefined,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: ''
    },
    match: undefined,
    document: mockDocument,
    highlighted: false,
    viewDocumentOption: fakeDropdownOption({ key: 'view', value: 'anon', onClick: jest.fn() }),
    downloadDocumentOption: fakeDropdownOption({ onClick: jest.fn(), key: 'download', value: 'anon' }),
    getUserNameFromDocumentUploaderId: jest.fn((idUser: string) => 'no-one'),
    renderEllipsisMenu: doc => <div>ellipsis</div>
  }
  it('renders', () => {
    expect(
      renderer
        .create(
          <Router>
            <CounterpartyDocumentListItem {...mockProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
