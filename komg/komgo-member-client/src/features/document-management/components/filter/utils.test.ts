import { getDocumentTypeFilterOptions } from './utils'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocumentTypes } from '../../store/document-types/mock-data'

describe('getDocumentTypeFilterOptions', () => {
  it('should match snapshot', () => {
    expect(getDocumentTypeFilterOptions(mockCategories, mockDocumentTypes)).toMatchSnapshot()
  })
})
