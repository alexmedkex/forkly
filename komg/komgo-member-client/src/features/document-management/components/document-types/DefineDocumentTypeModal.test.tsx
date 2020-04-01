import { shallow } from 'enzyme'
import * as React from 'react'

import { mockCategories } from '../../store/categories/mock-data'

import DefineDocumentTypeModal, { Props } from './DefineDocumentTypeModal'

describe('DefineDocumentTypeModal component', () => {
  const mockProps: Props = {
    visible: true,
    title: 'anonTitle',
    categories: mockCategories,
    predefinedData: { category: 'anonCategory', name: 'anonName' },
    toggleVisible: jest.fn(),
    onCreateSuccess: jest.fn(),
    onEditSuccess: jest.fn()
  }

  it('should render a DocumentActionsButtonGroup item with visible=false', () => {
    const wrapper = shallow(<DefineDocumentTypeModal {...mockProps} />)
    expect(wrapper.find('DefineDocumentTypeModal').exists).toBeTruthy()
  })
})
