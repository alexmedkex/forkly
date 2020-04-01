import { shallow } from 'enzyme'
import * as React from 'react'

import mockCounterparties from '../../counterparties/store/mockData'
import { mockCategories } from '../store/categories/mock-data'
import { mockDocumentTypes } from '../store/document-types/mock-data'
import { mockDocuments } from '../store/documents/mock-data'
import { initialModalStateFields } from '../store/modals/reducer'

import { ModalsContainer } from './ModalsContainer'
import { Document } from '../store/types'

describe('ModalsContainer component', () => {
  const mockProps = {
    titleModalEditCreateDocType: 'editCreateDoc',
    selectedModalCategories: mockCategories,
    selectedModalDocumentTypes: mockDocumentTypes,
    selectedDocuments: mockDocuments.map(d => d.id),
    predefinedData: { category: 'anonCategory', name: 'anonName', id: 'anonId' },
    categories: mockCategories,
    loadedDocument: mockDocuments[0],
    documentTypes: mockDocumentTypes,
    allVisibleDocuments: mockDocuments,
    counterparties: mockCounterparties.counterparties,
    modals: initialModalStateFields.modals,
    toggleModalVisible: jest.fn((modalName: string) => void 0),
    setModalStep: jest.fn((modalName, step: number) => void 0),
    sendDocumentsAsync: jest.fn((request, productId) => void 0),
    createDocumentAsync: jest.fn((createDocumentRequest, productId) => void 0),
    fetchDocumentsAsync: jest.fn((productId, sharedBy?) => void 0),
    createDocumentTypeAsync: jest.fn((documentType, productId) => void 0),
    updateDocumentTypeAsync: jest.fn((documentType, productId) => void 0),
    deleteDocumentAsync: jest.fn(),
    createDocumentLinkAsync: jest.fn(),
    revokeExtSharedDoc: jest.fn(),
    downloadDocumentWithLinkAsync: jest.fn(),
    userId: 'userId',
    allDocs: [],
    items: []
  }

  it('should render a child div with DocumentModalsContainerManagementContainer item with props', () => {
    const wrapper = shallow(<ModalsContainer {...mockProps} />)
    expect(wrapper.find('ModalsContainer').exists).toBeTruthy()
  })

  it('should render a child div with ModalsContainer item with entity of templates', () => {
    const wrapper = shallow(<ModalsContainer {...mockProps} />)
    expect(wrapper.find('ModalsContainer').exists).toBeTruthy()
  })
})
