import * as React from 'react'
import * as renderer from 'react-test-renderer'
import OurDocumentsLibrary, { Props } from './OurDocumentsLibrary'
import { fakeDocument, fakeDropdownOption } from '../../../utils/faker'
import { groupBy } from '../my-documents/toMap'
import { Provider } from 'react-redux'
import { store } from '../../../../../store'

describe('CounterpartyDocumentListItem', () => {
  const mockDocuments = ['1', '2', '3'].map(id => fakeDocument({ id, name: `anon-${id}.xyz` }))
  const mockDocsByCategory = groupBy(mockDocuments, doc => doc.category.id)
  const mockCategoriesById = groupBy(mockDocuments.map(doc => doc.category), cat => cat.id)
  const mockProps: Props = {
    context: 'document-library',
    documentsByCategoryId: mockDocsByCategory,
    categoriesById: mockCategoriesById,
    highlightedDocumentId: null,
    selectedDocuments: [],
    visible: false,
    getCategoryDocumentCount: jest.fn(cat => (mockDocsByCategory.get((cat as any).id) || []).length),
    renderEllipsisMenu: jest.fn(() => <div />),
    getUserNameFromDocumentUploaderId: jest.fn((idUser: string) => 'no-one'),
    clearHighlightedDocumentId: jest.fn(),
    handleDocumentSelect: jest.fn(),
    bulkSelectDocuments: jest.fn(),
    getViewDocumentOption: jest.fn(doc => fakeDropdownOption({ key: 'view', value: 'anon', onClick: jest.fn() })),
    getDownloadDocumentOption: jest.fn(doc =>
      fakeDropdownOption({ key: 'download', value: 'anon', onClick: jest.fn() })
    )
  }
  it('renders', () => {
    expect(
      renderer
        .create(
          <Provider store={store}>
            <OurDocumentsLibrary {...mockProps} />
          </Provider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
