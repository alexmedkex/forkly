import { shallow } from 'enzyme'
import * as React from 'react'
import SearchComponent from './SearchComponent'

import { mockData } from '../../../document-management/store/templates/mock-data'

describe('SearchComponent component', () => {
  const mockFunc = jest.fn(() => void 0)
  const mockProps = {
    dataPoints: mockData,
    handleSearch: mockFunc
  }

  it('should render a SearchComponent item with props', () => {
    const wrapper = shallow(<SearchComponent {...mockProps} />)
    expect(wrapper.find('SearchComponent').exists).toBeTruthy()
  })
})
