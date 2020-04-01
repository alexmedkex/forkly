import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { OurDocumentsPanelItem, Props } from './OurDocumentsPanelItem'
import { fakeDocument } from '../../../utils/faker'

describe('CounterpartyDocumentListItem', () => {
  const mockDocument = fakeDocument({ name: 'anon.ext', uploadInfo: { uploaderUserId: '-1' } })
  const mockProps: Props = {
    active: false,
    category: mockDocument.category,
    documentCount: 1,
    checked: false,
    indeterminate: false,
    handleCategorySelect: jest.fn(),
    onTitleClick: jest.fn()
  }
  it('renders', () => {
    expect(renderer.create(<OurDocumentsPanelItem {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
