import { shallow } from 'enzyme'
import * as React from 'react'
import LoadTemplateModal from './LoadTemplateModal'

import { mockData } from '../../../document-management/store/templates/mock-data'

import { mockCategories } from '../../../document-management/store/categories/mock-data'

import { mockDocumentTypes } from '../../../document-management/store/document-types/mock-data'

describe('LoadTemplateModal component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = {
    title: 'test',
    templates: mockData,
    toggleVisible: mockFunc,
    categories: mockCategories,
    documentTypes: mockDocumentTypes,
    selectedCounterpartyName: '',
    selectedCounterpartyId: 'id',
    sentDocumentRequestTypes: new Map(),
    onSubmit: mockFunc
  }

  it('should render a LoadTemplateModal item with props', () => {
    const wrapper = shallow(<LoadTemplateModal {...mockProps} visible={true} />)
    expect(wrapper.find('LoadTemplateModal').exists).toBeTruthy()
  })

  it('should render a LoadTemplateModal item with props', () => {
    const wrapper = shallow(<LoadTemplateModal {...mockProps} visible={false} />)
    expect(wrapper.find('LoadTemplateModal').exists).toBeTruthy()
  })
})
