import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { mockCategories } from '../../../store/categories/mock-data'
import { mockDocumentTypes } from '../../../store/document-types/mock-data'
import DocumentsByCategoryList from './DocumentsByCategoryList'
import { MemoryRouter as Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
describe('DocumentsList.tsx', () => {
  let mockProps

  beforeEach(() => {
    const mockFunc = jest.fn(() => void 0)
    const CATEGORIES = mockCategories
    const DOCUMENT_TYPES = mockDocumentTypes
    mockProps = {
      history: createMemoryHistory(),
      location: {
        pathname: '',
        search: '',
        state: '',
        hash: ''
      },
      context: 'document-library',
      selectedCategoryId: CATEGORIES[0].id,
      categories: CATEGORIES,
      documentTypes: DOCUMENT_TYPES,
      documents: [],
      handleSelectDocument: mockFunc,
      handleSelectDocumentType: mockFunc,
      renderDocumentDropdownActions: mockFunc,
      renderDocumentTypeDropdownActions: mockFunc,
      type: DocumentsByCategoryList,
      selectedDocuments: [],
      documentsGroupByType: new Map([['all', []]]),
      isFiltered: false,
      componentInCaseNoDocuments: jest.fn(() => 'NO DOCUMENTS IN LIBRARY'),
      bulkSelectDocuments: jest.fn(() => void 0)
    }
  })

  it('should render a DocumentsByCategoryList component', () => {
    expect(
      renderer
        .create(
          <Router>
            <DocumentsByCategoryList {...mockProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
