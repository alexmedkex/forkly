import * as React from 'react'
import { shallow } from 'enzyme'
import RemoveDropdown from './RemoveDropdown'

describe('RemoveDropdown component', () => {
  it('should render RemoveDropdown component', () => {
    const wrapper = shallow(<RemoveDropdown />)
    expect(wrapper.exists()).toBe(true)
  })
})
