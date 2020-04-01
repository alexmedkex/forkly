import { shallow } from 'enzyme'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { mockDocumentTypes } from '../../store/document-types/mock-data'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocuments } from '../../store/documents/mock-data'
import { AlreadySentDoctypeTile } from './AlreadySentDoctypeTile'

describe('AlreadySentDoctypeTile', () => {
  const defaultProps = {
    active: true,
    docType: mockDocumentTypes[0],
    documents: mockDocuments,
    category: mockCategories[0],
    openViewDocument: jest.fn(),
    counterpartyId: 'societegenerale'
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<AlreadySentDoctypeTile {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should match snapshot when document types is empty array', () => {
    expect(renderer.create(<AlreadySentDoctypeTile {...defaultProps} documents={[]} />).toJSON()).toMatchSnapshot()
  })

  it('should find the chevron icon to expand/collapse', () => {
    const wrapper = shallow(<AlreadySentDoctypeTile {...defaultProps} />)

    const chevron = wrapper.find(`[data-test-id="document-type-tile-chevron-${mockCategories[0].name}"]`)

    expect(chevron.prop('name')).toEqual('chevron right')
  })
})
