import * as React from 'react'
import { shallow } from 'enzyme'
import { LCDocumentList } from './LCDocumentList'
import { initialDocumentsFilters } from '../../../document-management/store/documents/reducer'
import { fakeLetterOfCredit } from '../../utils/faker'
describe('LCDocumentList component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      filters: initialDocumentsFilters,
      categories: [],
      documentTypes: [],
      documentsGroupByType: new Map(),
      isLoadingDocuments: false,
      isLoadingDocumentTypes: false,
      letterOfCredit: fakeLetterOfCredit(),
      fetchDocumentsAsync: jest.fn(),
      fetchCategoriesAsync: jest.fn(),
      fetchDocumentTypesAsync: jest.fn(),
      downloadDocumentsAsync: jest.fn(),
      allDocs: [],
      match: {
        params: {
          id: ''
        }
      }
    }
  })

  it('should render component properly', () => {
    const wrapper = shallow(<LCDocumentList {...defaultProps} />)
    expect(wrapper.exists()).toBe(true)
  })
})
