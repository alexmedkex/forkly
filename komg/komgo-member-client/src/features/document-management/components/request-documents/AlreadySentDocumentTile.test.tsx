import { shallow } from 'enzyme'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { mockDocumentTypes } from '../../store/document-types/mock-data'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocuments } from '../../store/documents/mock-data'
import { AlreadySentDocumentTile } from './AlreadySentDocumentTile'

describe('AlreadySentDocumentTile', () => {
  const defaultProps = {
    document: mockDocuments[0],
    index: 20,
    openViewDocument: jest.fn(),
    counterpartyId: 'societegenerale'
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<AlreadySentDocumentTile {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should find the index', () => {
    const wrapper = shallow(<AlreadySentDocumentTile {...defaultProps} />)

    const index = wrapper.find(`[data-test-id="already-sent-doc-index-${defaultProps.document.id}"]`)
    expect(index.props().children).toEqual(20)
  })
})
