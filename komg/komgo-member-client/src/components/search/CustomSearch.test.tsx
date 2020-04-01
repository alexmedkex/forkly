import * as React from 'react'
import { shallow } from 'enzyme'
import CustomSearch from './CustomSearch'

const defaultProps = {
  handleSearch: jest.fn()
}

describe('Search component', () => {
  it('should render search component', () => {
    const wrapper = shallow(<CustomSearch {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
})
