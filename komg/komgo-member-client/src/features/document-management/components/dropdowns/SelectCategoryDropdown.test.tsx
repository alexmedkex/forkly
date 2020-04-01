import { shallow } from 'enzyme'
import * as React from 'react'

import { initialDocumentsFilters } from '../../store/documents/reducer'
import { mockCategories } from '../../store/categories/mock-data'
import { FILTERS_NAME } from '../../store/types/document'
import { SelectCategoryDropdown, Props } from './SelectCategoryDropdown'

describe('SelectCategoryDropdown component', () => {
  const mockProps: Props = {
    disabled: false,
    filters: initialDocumentsFilters,
    categories: mockCategories,
    onCategorySelect: jest.fn((filter: string, value: string) => void 0)
  }

  it('should render a SelectCategoryDropdown item with props', () => {
    const wrapper = shallow(<SelectCategoryDropdown {...mockProps} />)
    expect(wrapper.find('SelectCategoryDropdown').exists).toBeTruthy()
  })

  it('should call onCategorySelect with a string `value` onChange', () => {
    const wrapper = shallow(<SelectCategoryDropdown {...mockProps} />)
    const anonCategoryValue = { value: 'anonCategoryId' }
    wrapper.simulate('change', FILTERS_NAME.CATEGORY, anonCategoryValue)
    expect(mockProps.onCategorySelect).lastCalledWith(FILTERS_NAME.CATEGORY, 'anonCategoryId')
  })
})
