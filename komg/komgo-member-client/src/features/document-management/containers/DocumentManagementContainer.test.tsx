import { shallow } from 'enzyme'
import * as React from 'react'
import { Map } from 'immutable'
import { DocumentManagementContainer, IProps } from './DocumentManagementContainer'

import { mockCategories } from '../store/categories/mock-data'
import { mockDocumentTypes } from '../store/document-types/mock-data'
import { mockDocuments } from '../store/documents/mock-data'
import { initialDocumentsFilters } from '../store/documents/reducer'
import { User } from '../../../fixtures/user/types'
import { Document } from '../store'
import { setDocumentListFilter } from '../store/documents/actions'
const defaultStaticId: string = 'companyStaticId'

describe('DocumentManagementContainer component', () => {
  type EntityType = 'templates' | 'docTypes' | 'documents'

  const documentManagementPropsStub: Partial<IProps> = {
    history: [],
    entity: 'documents' as EntityType,
    templates: [],
    counterparties: [],
    allDocs: [],
    allVisibleDocuments: [],
    match: {
      isExact: true,
      path: '',
      url: '',
      params: null
    },
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: ''
    },
    staticContext: undefined,
    isAuthorized: () => true,
    isLicenseEnabled: () => true,
    isLicenseEnabledForCompany: () => true,
    categories: mockCategories,
    documentTypes: mockDocumentTypes,
    documentsSearchResult: mockDocuments,
    isLoading: false,
    selectedCategoryId: 'all',
    filters: initialDocumentsFilters,
    documentListFilter: {},
    selectedDocuments: [],
    isLoadingDocumentTypes: false,
    isLoadingDocuments: false,
    documentsById: Map<string, Document>(),
    documentsGroupByType: Map().set('all', []) as any,
    usersById: Map<string, User[]>().set('-1', []) as any,
    fetchUsersAsync: () => null,
    fetchProductsAsync: () => null,
    fetchCategoriesAsync: () => null,
    fetchDocumentTypesAsync: () => null,
    fetchTemplatesAsync: () => null,
    fetchRequestsAsync: () => null,
    fetchDocumentsAsync: () => null,
    searchDocumentsAsync: () => null,
    fetchConnectedCounterpartiesAsync: () => null,
    downloadDocumentsAsync: () => null,
    changeDocumentsFilter: () => null,
    selectDocument: () => null,
    selectDocumentType: () => null,
    toggleModalVisible: () => null,
    resetDocumentsSelectData: () => null,
    resetLoadedDocument: () => null,
    bulkSelectDocuments: () => null,
    createDocumentAsync: () => null,
    setDocumentListFilter: jest.fn(),
    user: {
      id: '',
      username: 'User 1',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'email@test.com',
      createdAt: 123,
      company: defaultStaticId
    }
  }

  const documentManagementProps = documentManagementPropsStub as IProps

  it('should render a child div with DocumentManagementContainer item with props', () => {
    const wrapper = shallow(<DocumentManagementContainer {...documentManagementProps} />)
    expect(wrapper.find('DocumentManagementContainer').exists).toBeTruthy()
  })

  it('should render a child div with DocumentManagementContainer item with entity of templates', () => {
    const wrapper = shallow(<DocumentManagementContainer {...documentManagementProps} />)
    expect(wrapper.find('DocumentManagementContainer').exists).toBeTruthy()
  })
})
