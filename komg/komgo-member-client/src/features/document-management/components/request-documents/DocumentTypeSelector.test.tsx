import { shallow } from 'enzyme'
import * as React from 'react'
import { DocumentTypeSelector } from './DocumentTypeSelector'

import { mockData } from '../../../document-management/store/templates/mock-data'
import { Category, DocumentType } from '../../store'
import { mockProduct } from '../../store/products/mock-data'
import * as renderer from 'react-test-renderer'

describe('DocumentTypeSelector component', () => {
  const mockFunc = jest.fn(() => void 0)
  const mockProps = {
    categories: [],
    documentTypes: [],
    selectedDocumentTypes: new Set<string>(),
    counterSelectedDoctypes: new Map(),
    toggleSelectionDocType: mockFunc
  }
  const mockCategory: Category = { id: 'banking-documents', name: 'banking-documents', product: mockProduct }
  const mockDocumentType: DocumentType = {
    product: { name: 'KYC', id: 'kyc' },
    category: { name: 'business-description', id: 'business-description', product: { name: 'KYC', id: 'kyc' } },
    name: 'Identity Documents',
    id: '1',
    fields: [],
    predefined: false
  }
  const mockProps2 = {
    categories: [mockCategory],
    documentTypes: [mockDocumentType],
    selectedDocumentTypes: new Set<string>(),
    counterSelectedDoctypes: new Map(),
    toggleSelectionDocType: mockFunc
  }

  it('should render an empty DocumentTypeSelector item with props', () => {
    const wrapper = shallow(<DocumentTypeSelector {...mockProps} />)
    expect(wrapper.find('DocumentTypeSelector').exists).toBeTruthy()
  })

  it('should render a mocked data DocumentTypeSelector item with props', () => {
    const wrapper = shallow(<DocumentTypeSelector {...mockProps2} />)
    expect(wrapper.find('DocumentTypeSelector').exists).toBeTruthy()
    expect(wrapper.find('List').exists).toBeTruthy()
    expect(wrapper.find('Divider').exists).toBeTruthy()
    expect(wrapper.find('StyledListDocTypes').exists).toBeTruthy()
  })

  it('renders', () => {
    expect(renderer.create(<DocumentTypeSelector {...mockProps2} />).toJSON()).toMatchSnapshot()
  })
})
