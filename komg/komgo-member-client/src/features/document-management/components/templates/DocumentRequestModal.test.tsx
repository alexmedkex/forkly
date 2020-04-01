import { shallow } from 'enzyme'
import * as React from 'react'
import DocumentRequestModal, { Props } from './DocumentRequestModal'
import { DocumentType } from '../../../document-management/store'
import { mockCategories } from '../../../document-management/store/categories/mock-data'
import { mockDocumentTypes } from '../../../document-management/store/document-types/mock-data'

describe('DocumentRequestModal component', () => {
  const mockToggleVisible = jest.fn(() => void 0)

  const mockOnSubmit = jest.fn((documentTypes: DocumentType[]) => void 0)
  const mockProps: Props = {
    visible: false,
    title: 'test',
    categories: mockCategories,
    documentTypes: mockDocumentTypes,
    toggleVisible: mockToggleVisible,
    onSubmit: mockOnSubmit,
    selectedCounterpartyName: 'anon',
    selectedCounterpartyId: 'id',
    sentDocumentRequestTypes: new Map()
  }

  it('should render a DocumentRequestModal item with props', () => {
    const wrapper = shallow(<DocumentRequestModal {...mockProps} visible={true} />)
    expect(wrapper.find('DocumentRequestModal').exists).toBeTruthy()
  })

  it('should render a DocumentRequestModal item with props', () => {
    const wrapper = shallow(<DocumentRequestModal {...mockProps} visible={false} />)
    expect(wrapper.find('DocumentRequestModal').exists).toBeTruthy()
  })
})
