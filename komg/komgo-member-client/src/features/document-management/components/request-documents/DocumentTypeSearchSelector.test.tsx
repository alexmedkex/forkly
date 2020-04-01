import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

import DocumentTypeFilteredSelector from './DocumentTypeFilteredSelector'
import { mockDocumentTypes } from '../../store/document-types/mock-data'

describe('DocumentTypeSearchSelector', () => {
  const defaultProps = {
    documentTypes: mockDocumentTypes,
    selectedDocumentTypes: new Set<string>(),
    search: '',
    toggleSelectionDocType: jest.fn()
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<DocumentTypeFilteredSelector {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should match snapshot when document types is empty array', () => {
    expect(
      renderer.create(<DocumentTypeFilteredSelector {...defaultProps} documentTypes={[]} />).toJSON()
    ).toMatchSnapshot()
  })

  it('should find selected checkbox', () => {
    const wrapper = shallow(
      <DocumentTypeFilteredSelector {...defaultProps} selectedDocumentTypes={new Set(['passports-of-ubos'])} />
    )

    const passportCheckbox = wrapper.find('[data-test-id="request-documents-doctype-checkbox-passports-of-ubos"]')

    expect(passportCheckbox.prop('checked')).toBe(true)
  })
})
